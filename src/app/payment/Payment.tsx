import { CartChangedError, CheckoutSelectors, CheckoutSettings, OrderRequestBody, PaymentMethod } from '@bigcommerce/checkout-sdk';
import { memoizeOne } from '@bigcommerce/memoize';
import { compact, find, isEmpty, noop } from 'lodash';
import React, { Component, ReactNode } from 'react';
import { ObjectSchema } from 'yup';

import { withCheckout, CheckoutContextProps } from '../checkout';
import { isCartChangedError, isRequestError, ErrorModal, ErrorModalOnCloseProps } from '../common/error';
import { EMPTY_ARRAY } from '../common/utility';
import { withLanguage, WithLanguageProps } from '../locale';
import { TermsConditionsType } from '../termsConditions';
import { LoadingOverlay } from '../ui/loading';

import mapSubmitOrderErrorMessage, { mapSubmitOrderErrorTitle } from './mapSubmitOrderErrorMessage';
import mapToOrderRequestBody from './mapToOrderRequestBody';
import { getUniquePaymentMethodId, PaymentMethodId, PaymentMethodProviderType } from './paymentMethod';
import PaymentContext from './PaymentContext';
import PaymentForm, { PaymentFormValues } from './PaymentForm';

export interface PaymentProps {
    isEmbedded?: boolean;
    isUsingMultiShipping?: boolean;
    checkEmbeddedSupport?(methodIds: string[]): void; // TODO: We're currently doing this check in multiple places, perhaps we should move it up so this check get be done in a single place instead.
    onCartChangedError?(error: CartChangedError): void;
    onFinalize?(): void;
    onFinalizeError?(error: Error): void;
    onReady?(): void;
    onSubmit?(): void;
    onSubmitError?(error: Error): void;
    onUnhandledError?(error: Error): void;
}

interface WithCheckoutPaymentProps {
    availableStoreCredit: number;
    cartUrl: string;
    defaultMethod?: PaymentMethod;
    finalizeOrderError?: Error;
    isInitializingPayment: boolean;
    isSubmittingOrder: boolean;
    isStoreCreditApplied: boolean;
    isTermsConditionsRequired: boolean;
    methods: PaymentMethod[];
    shouldExecuteSpamCheck: boolean;
    shouldLocaliseErrorMessages: boolean;
    submitOrderError?: Error;
    termsConditionsText?: string;
    termsConditionsUrl?: string;
    usableStoreCredit: number;
    applyStoreCredit(useStoreCredit: boolean): Promise<CheckoutSelectors>;
    clearError(error: Error): void;
    finalizeOrderIfNeeded(): Promise<CheckoutSelectors>;
    isPaymentDataRequired(): boolean;
    loadCheckout(): Promise<CheckoutSelectors>;
    loadPaymentMethods(): Promise<CheckoutSelectors>;
    submitOrder(values: OrderRequestBody): Promise<CheckoutSelectors>;
}

interface PaymentState {
    didExceedSpamLimit: boolean;
    isReady: boolean;
    selectedMethod?: PaymentMethod;
    shouldDisableSubmit: { [key: string]: boolean };
    shouldHidePaymentSubmitButton: { [key: string]: boolean };
    submitFunctions: { [key: string]: ((values: PaymentFormValues) => void) | null };
    validationSchemas: { [key: string]: ObjectSchema<Partial<PaymentFormValues>> | null };
}

class Payment extends Component<PaymentProps & WithCheckoutPaymentProps & WithLanguageProps, PaymentState> {
    state: PaymentState = {
        didExceedSpamLimit: false,
        isReady: false,
        shouldDisableSubmit: {},
        shouldHidePaymentSubmitButton: {},
        validationSchemas: {},
        submitFunctions: {},
    };

    private getContextValue = memoizeOne(() => {
        return {
            disableSubmit: this.disableSubmit,
            setSubmit: this.setSubmit,
            setValidationSchema: this.setValidationSchema,
            hidePaymentSubmitButton: this.hidePaymentSubmitButton,
        };
    });

    async componentDidMount(): Promise<void> {
        const {
            finalizeOrderIfNeeded,
            loadPaymentMethods,
            onFinalize = noop,
            onFinalizeError = noop,
            onReady = noop,
            onUnhandledError = noop,
        } = this.props;

        try {
            await loadPaymentMethods();
        } catch (error) {
            onUnhandledError(error);
        }

        try {
            await finalizeOrderIfNeeded();
            onFinalize();
        } catch (error) {
            if (error.type !== 'order_finalization_not_required') {
                onFinalizeError(error);
            }
        }

        window.addEventListener('beforeunload', this.handleBeforeUnload);
        this.setState({ isReady: true });
        onReady();
    }

    componentDidUpdate(): void {
        const {
            checkEmbeddedSupport = noop,
            methods,
        } = this.props;

        checkEmbeddedSupport(methods.map(({ id }) => id));
    }

    componentWillUnmount(): void {
        window.removeEventListener('beforeunload', this.handleBeforeUnload);
    }

    render(): ReactNode {
        const {
            defaultMethod,
            finalizeOrderError,
            isInitializingPayment,
            isUsingMultiShipping,
            methods,
            applyStoreCredit,
            ...rest
        } = this.props;

        const {
            didExceedSpamLimit,
            isReady,
            selectedMethod = defaultMethod,
            shouldDisableSubmit,
            validationSchemas,
            shouldHidePaymentSubmitButton,
        } = this.state;

        const uniqueSelectedMethodId = (
            selectedMethod &&
            getUniquePaymentMethodId(selectedMethod.id, selectedMethod.gateway)
        );

        return (
            <PaymentContext.Provider value={ this.getContextValue() }>
                <LoadingOverlay
                    isLoading={ !isReady }
                    unmountContentWhenLoading
                >
                    { !isEmpty(methods) && defaultMethod && <PaymentForm
                        { ...rest }
                        defaultGatewayId={ defaultMethod.gateway }
                        defaultMethodId={ defaultMethod.id }
                        didExceedSpamLimit={ didExceedSpamLimit }
                        isInitializingPayment={ isInitializingPayment }
                        isUsingMultiShipping={ isUsingMultiShipping }
                        methods={ methods }
                        onMethodSelect={ this.setSelectedMethod }
                        onStoreCreditChange={ this.handleStoreCreditChange }
                        onSubmit={ this.handleSubmit }
                        selectedMethod={ selectedMethod }
                        shouldDisableSubmit={ uniqueSelectedMethodId && shouldDisableSubmit[uniqueSelectedMethodId] || undefined }
                        shouldHidePaymentSubmitButton={ uniqueSelectedMethodId && shouldHidePaymentSubmitButton[uniqueSelectedMethodId] || undefined }
                        validationSchema={ uniqueSelectedMethodId && validationSchemas[uniqueSelectedMethodId] || undefined }
                    /> }
                </LoadingOverlay>

                { this.renderOrderErrorModal() }
                { this.renderEmbeddedSupportErrorModal() }
            </PaymentContext.Provider>
        );
    }

    private renderOrderErrorModal(): ReactNode {
        const {
            finalizeOrderError,
            language,
            shouldLocaliseErrorMessages,
            submitOrderError,
        } = this.props;

        // FIXME: Export correct TS interface
        const error: any = submitOrderError || finalizeOrderError;

        if (!error ||
            error.type === 'order_finalization_not_required' ||
            error.type === 'payment_cancelled' ||
            error.type === 'payment_invalid_form' ||
            error.type === 'spam_protection_not_completed' ||
            error.type === 'invalid_hosted_form_value') {
            return null;
        }

        return (
            <ErrorModal
                error={ error }
                message={ mapSubmitOrderErrorMessage(error, language.translate.bind(language), shouldLocaliseErrorMessages) }
                onClose={ this.handleCloseModal }
                title={ mapSubmitOrderErrorTitle(error, language.translate.bind(language)) }
            />
        );
    }

    private renderEmbeddedSupportErrorModal(): ReactNode {
        const {
            checkEmbeddedSupport = noop,
            methods,
        } = this.props;

        try {
            checkEmbeddedSupport(methods.map(({ id }) => id));
        } catch (error) {
            return (
                <ErrorModal
                    error={ error }
                    onClose={ this.handleCloseModal }
                />
            );
        }

        return null;
    }

    private disableSubmit: (
        method: PaymentMethod,
        disabled?: boolean
    ) => void = (method, disabled = true) => {
        const uniqueId = getUniquePaymentMethodId(method.id, method.gateway);
        const { shouldDisableSubmit } = this.state;

        if (shouldDisableSubmit[uniqueId] === disabled) {
            return;
        }

        this.setState({
            shouldDisableSubmit: {
                ...shouldDisableSubmit,
                [uniqueId]: disabled,
            },
        });
    };

    private hidePaymentSubmitButton: (
        method: PaymentMethod,
        disabled?: boolean
    ) => void = (method, disabled = true) => {
        const uniqueId = getUniquePaymentMethodId(method.id, method.gateway);
        const { shouldHidePaymentSubmitButton } = this.state;

        if (shouldHidePaymentSubmitButton[uniqueId] === disabled) {
            return;
        }

        this.setState({
            shouldHidePaymentSubmitButton: {
                ...shouldHidePaymentSubmitButton,
                [uniqueId]: disabled,
            },
        });
    };

    // tslint:disable:cyclomatic-complexity
    private handleBeforeUnload: (event: BeforeUnloadEvent) => string | undefined = event => {
        const { defaultMethod, isSubmittingOrder, language } = this.props;
        const { selectedMethod = defaultMethod } = this.state;

        // TODO: Perhaps there is a better way to handle `adyen`, `afterpay`, `amazon`,
        // `checkout.com`, `converge`, `sagepay`, `stripev3` and `sezzle`. They require
        //  a redirection to another website during the payment flow but are not
        //  categorised as hosted payment methods.
        if (!isSubmittingOrder ||
            !selectedMethod ||
            selectedMethod.type === PaymentMethodProviderType.Hosted ||
            selectedMethod.type === PaymentMethodProviderType.PPSDK ||
            selectedMethod.id === PaymentMethodId.Amazon ||
            selectedMethod.id === PaymentMethodId.AmazonPay ||
            selectedMethod.id === PaymentMethodId.Checkoutcom ||
            selectedMethod.id === PaymentMethodId.Converge ||
            selectedMethod.id === PaymentMethodId.Humm ||
            selectedMethod.id === PaymentMethodId.Laybuy ||
            selectedMethod.id === PaymentMethodId.Opy ||
            selectedMethod.id === PaymentMethodId.Quadpay ||
            selectedMethod.id === PaymentMethodId.SagePay ||
            selectedMethod.id === PaymentMethodId.Sezzle ||
            selectedMethod.id === PaymentMethodId.Zip ||
            selectedMethod.gateway === PaymentMethodId.AdyenV2 ||
            selectedMethod.gateway === PaymentMethodId.AdyenV2GooglePay ||
            selectedMethod.gateway === PaymentMethodId.Afterpay ||
            selectedMethod.gateway === PaymentMethodId.Clearpay ||
            selectedMethod.gateway === PaymentMethodId.Checkoutcom ||
            selectedMethod.gateway === PaymentMethodId.Mollie ||
            selectedMethod.gateway === PaymentMethodId.StripeV3) {
            return;
        }

        const message = language.translate('common.leave_warning');

        event.returnValue = message;

        return message;
    };

    private handleCloseModal: (
        event: Event,
        props: ErrorModalOnCloseProps
    ) => Promise<void> = async (_, { error }) => {
        if (!error) {
            return;
        }

        const { cartUrl, clearError, loadCheckout } = this.props;
        const { type: errorType } = error as any; // FIXME: Export correct TS interface

        if (errorType === 'provider_fatal_error' ||
            errorType === 'order_could_not_be_finalized_error') {
            window.location.replace(cartUrl || '/');
        }

        if (errorType === 'tax_provider_unavailable') {
            window.location.reload();
        }

        if (isRequestError(error)) {
            const { body, headers, status } = error;

            if (body.type === 'provider_error' && headers.location) {
                window.top.location.assign(headers.location);
            }

            // Reload the checkout object to get the latest `shouldExecuteSpamCheck` value,
            // which will in turn make `SpamProtectionField` visible again.
            // NOTE: As a temporary fix, we're checking the status code instead of the error
            // type because of an issue with Nginx config, which causes the server to return
            // HTML page instead of JSON response when there is a 429 error.
            if (status === 429 || body.type === 'spam_protection_expired' || body.type === 'spam_protection_failed') {
                this.setState({ didExceedSpamLimit: true });

                await loadCheckout();
            }
        }

        clearError(error);
    };

    private handleStoreCreditChange: (useStoreCredit: boolean) => void = async useStoreCredit => {
        const {
            applyStoreCredit,
            onUnhandledError = noop,
        } = this.props;

        try {
            await applyStoreCredit(useStoreCredit);
        } catch (e) {
            onUnhandledError(e);
        }
    };

    private handleSubmit: (values: PaymentFormValues) => void = async values => {
        const {
            defaultMethod,
            loadPaymentMethods,
            isPaymentDataRequired,
            onCartChangedError = noop,
            onSubmit = noop,
            onSubmitError = noop,
            submitOrder,
        } = this.props;

        const {
            selectedMethod = defaultMethod,
            submitFunctions,
        } = this.state;

        const customSubmit = selectedMethod && submitFunctions[
            getUniquePaymentMethodId(selectedMethod.id, selectedMethod.gateway)
        ];

        if (customSubmit) {
            return customSubmit(values);
        }

        try {
            await submitOrder(mapToOrderRequestBody(values, isPaymentDataRequired()));
            onSubmit();
        } catch (error) {
            if (error.type === 'payment_method_invalid') {
                return loadPaymentMethods();
            }

            if (isCartChangedError(error)) {
                return onCartChangedError(error);
            }

            onSubmitError(error);
        }
    };

    private setSelectedMethod: (method?: PaymentMethod) => void = method => {
        const { selectedMethod } = this.state;

        if (selectedMethod === method) {
            return;
        }

        this.setState({ selectedMethod: method });
    };

    private setSubmit: (
        method: PaymentMethod,
        fn: (values: PaymentFormValues) => void | null
    ) => void = (method, fn) => {
        const uniqueId = getUniquePaymentMethodId(method.id, method.gateway);
        const { submitFunctions } = this.state;

        if (submitFunctions[uniqueId] === fn) {
            return;
        }

        this.setState({
            submitFunctions: {
                ...submitFunctions,
                [uniqueId]: fn,
            },
        });
    };

    private setValidationSchema: (
        method: PaymentMethod,
        schema: ObjectSchema<Partial<PaymentFormValues>> | null
    ) => void = (method, schema) => {
        const uniqueId = getUniquePaymentMethodId(method.id, method.gateway);
        const { validationSchemas } = this.state;

        if (validationSchemas[uniqueId] === schema) {
            return;
        }

        this.setState({
            validationSchemas: {
                ...validationSchemas,
                [uniqueId]: schema,
            },
        });
    };
}

export function mapToPaymentProps({
    checkoutService,
    checkoutState,
}: CheckoutContextProps): WithCheckoutPaymentProps | null {
    const {
        data: {
            getCheckout,
            getConfig,
            getCustomer,
            getConsignments,
            getOrder,
            getPaymentMethod,
            getPaymentMethods,
            isPaymentDataRequired,
        },
        errors: {
            getFinalizeOrderError,
            getSubmitOrderError,
        },
        statuses: {
            isInitializingPayment,
            isSubmittingOrder,
        },
    } = checkoutState;

    const checkout = getCheckout();
    const config = getConfig();
    const customer = getCustomer();
    const consignments = getConsignments();
    const { isComplete = false } = getOrder() || {};
    const methods = getPaymentMethods() || EMPTY_ARRAY;

    if (!checkout || !config || !customer || isComplete) {
        return null;
    }

    const {
        enableTermsAndConditions: isTermsConditionsEnabled,
        features,
        orderTermsAndConditionsType: termsConditionsType,
        orderTermsAndConditions: termsCondtitionsText,
        orderTermsAndConditionsLink: termsCondtitionsUrl,
    } = config.checkoutSettings as CheckoutSettings & { orderTermsAndConditionsLocation: string };

    const isTermsConditionsRequired = isTermsConditionsEnabled;
    const selectedPayment = find(checkout.payments, { providerType: PaymentMethodProviderType.Hosted });

    const { isStoreCreditApplied } = checkout;

    let selectedPaymentMethod;
    let filteredMethods;

    filteredMethods = methods.filter((method: PaymentMethod) => {
        if (method.id === PaymentMethodId.Bolt && method.initializationData) {
            return !!method.initializationData.showInCheckout;
        }

        return true;
    });

    if (consignments && consignments.length > 1) {
        const multiShippingIncompatibleMethodIds: string[] = [
            PaymentMethodId.AmazonPay,
            PaymentMethodId.Amazon,
        ];

        filteredMethods = methods.filter((method: PaymentMethod) => {
            return multiShippingIncompatibleMethodIds.indexOf(method.id) === -1;
        });
    }

    if (selectedPayment) {
        selectedPaymentMethod = getPaymentMethod(selectedPayment.providerId, selectedPayment.gatewayId);
        filteredMethods = selectedPaymentMethod ? compact([selectedPaymentMethod]) : filteredMethods;
    } else {
        selectedPaymentMethod = find(filteredMethods, { config: { hasDefaultStoredInstrument: true } });
        filteredMethods = filteredMethods;
    }

    return {
        applyStoreCredit: checkoutService.applyStoreCredit,
        availableStoreCredit: customer.storeCredit,
        cartUrl: config.links.cartLink,
        clearError: checkoutService.clearError,
        defaultMethod: selectedPaymentMethod ? selectedPaymentMethod : filteredMethods[0],
        finalizeOrderError: getFinalizeOrderError(),
        finalizeOrderIfNeeded: checkoutService.finalizeOrderIfNeeded,
        loadCheckout: checkoutService.loadCheckout,
        isInitializingPayment: isInitializingPayment(),
        isPaymentDataRequired,
        isStoreCreditApplied,
        isSubmittingOrder: isSubmittingOrder(),
        isTermsConditionsRequired,
        loadPaymentMethods: checkoutService.loadPaymentMethods,
        methods: filteredMethods,
        shouldExecuteSpamCheck: checkout.shouldExecuteSpamCheck,
        shouldLocaliseErrorMessages: features['PAYMENTS-6799.localise_checkout_payment_error_messages'],
        submitOrder: checkoutService.submitOrder,
        submitOrderError: getSubmitOrderError(),
        termsConditionsText: isTermsConditionsRequired && termsConditionsType === TermsConditionsType.TextArea ?
            termsCondtitionsText :
            undefined,
        termsConditionsUrl: isTermsConditionsRequired && termsConditionsType === TermsConditionsType.Link ?
            termsCondtitionsUrl :
            undefined,
        usableStoreCredit: checkout.grandTotal > 0 ?
            Math.min(checkout.grandTotal, customer.storeCredit || 0) : 0,
    };
}

export default withLanguage(withCheckout(mapToPaymentProps)(Payment));
