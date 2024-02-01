import {
    CartChangedError,
    CheckoutSelectors,
    CheckoutService,
    CheckoutSettings,
    OrderRequestBody,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk';
import { memoizeOne } from '@bigcommerce/memoize';
import { compact, find, isEmpty, noop } from 'lodash';
import React, { Component, ReactNode } from 'react';
import { ObjectSchema } from 'yup';

import { AnalyticsContextProps } from '@bigcommerce/checkout/analytics';
import { ErrorLogger } from '@bigcommerce/checkout/error-handling-utils';
import { withLanguage, WithLanguageProps } from '@bigcommerce/checkout/locale';
import { CheckoutContextProps, PaymentFormValues } from '@bigcommerce/checkout/payment-integration-api';
import { ChecklistSkeleton } from '@bigcommerce/checkout/ui';

import { withAnalytics } from '../analytics';
import { withCheckout } from '../checkout';
import {
    ErrorModal,
    ErrorModalOnCloseProps,
    isCartChangedError,
    isErrorWithType,
} from '../common/error';
import { EMPTY_ARRAY } from '../common/utility';
import { TermsConditionsType } from '../termsConditions';

import mapSubmitOrderErrorMessage, { mapSubmitOrderErrorTitle } from './mapSubmitOrderErrorMessage';
import mapToOrderRequestBody from './mapToOrderRequestBody';
import PaymentContext from './PaymentContext';
import PaymentForm from './PaymentForm';
import {
    getUniquePaymentMethodId,
    PaymentMethodId,
    PaymentMethodProviderType,
} from './paymentMethod';

export interface PaymentProps {
    errorLogger: ErrorLogger;
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
    checkoutServiceSubscribe: CheckoutService['subscribe'];
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

class Payment extends Component<
    PaymentProps & WithCheckoutPaymentProps & WithLanguageProps & AnalyticsContextProps,
    PaymentState
> {
    state: PaymentState = {
        didExceedSpamLimit: false,
        isReady: false,
        shouldDisableSubmit: {},
        shouldHidePaymentSubmitButton: {},
        validationSchemas: {},
        submitFunctions: {},
    };

    private grandTotalChangeUnsubscribe?: () => void;

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
            onFinalize = noop,
            onFinalizeError = noop,
            onReady = noop,
            usableStoreCredit,
            checkoutServiceSubscribe,
        } = this.props;


        if (usableStoreCredit) {
            this.handleStoreCreditChange(true);
        }

        await this.loadPaymentMethodsOrThrow();

        try {
            const state = await finalizeOrderIfNeeded();
            const order = state.data.getOrder();

            onFinalize(order?.orderId);
        } catch (error) {
            if (isErrorWithType(error) && error.type !== 'order_finalization_not_required') {
                onFinalizeError(error);
            }
        }

        this.grandTotalChangeUnsubscribe = checkoutServiceSubscribe(
            () => this.handleCartTotalChange(),
            ({ data }) => data.getCheckout()?.grandTotal,
            ({ data }) => data.getCheckout()?.outstandingBalance,
        );

        window.addEventListener('beforeunload', this.handleBeforeUnload);
        this.setState({ isReady: true });
        onReady();
    }

    componentDidUpdate(): void {
        const { checkEmbeddedSupport = noop, methods } = this.props;

        checkEmbeddedSupport(methods.map(({ id }) => id));
    }

    componentWillUnmount(): void {
        if (this.grandTotalChangeUnsubscribe) {
            this.grandTotalChangeUnsubscribe();
            this.grandTotalChangeUnsubscribe = undefined;
        }

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

        const uniqueSelectedMethodId =
            selectedMethod && getUniquePaymentMethodId(selectedMethod.id, selectedMethod.gateway);

        return (
            <PaymentContext.Provider value={this.getContextValue()}>
                <ChecklistSkeleton isLoading={!isReady}>
                    {!isEmpty(methods) && defaultMethod && (
                        <PaymentForm
                            {...rest}
                            defaultGatewayId={defaultMethod.gateway}
                            defaultMethodId={defaultMethod.id}
                            didExceedSpamLimit={didExceedSpamLimit}
                            isInitializingPayment={isInitializingPayment}
                            isUsingMultiShipping={isUsingMultiShipping}
                            methods={methods}
                            onMethodSelect={this.setSelectedMethod}
                            onStoreCreditChange={this.handleStoreCreditChange}
                            onSubmit={this.handleSubmit}
                            onUnhandledError={this.handleError}
                            selectedMethod={selectedMethod}
                            shouldDisableSubmit={
                                (uniqueSelectedMethodId &&
                                    shouldDisableSubmit[uniqueSelectedMethodId]) ||
                                undefined
                            }
                            shouldHidePaymentSubmitButton={
                                (uniqueSelectedMethodId &&
                                    rest.isPaymentDataRequired() &&
                                    shouldHidePaymentSubmitButton[uniqueSelectedMethodId]) ||
                                undefined
                            }
                            validationSchema={
                                (uniqueSelectedMethodId &&
                                    validationSchemas[uniqueSelectedMethodId]) ||
                                undefined
                            }
                        />
                    )}
                </ChecklistSkeleton>

                {this.renderOrderErrorModal()}
                {this.renderEmbeddedSupportErrorModal()}
            </PaymentContext.Provider>
        );
    }

    private renderOrderErrorModal(): ReactNode {
        const { finalizeOrderError, language, shouldLocaliseErrorMessages, submitOrderError } =
            this.props;

        // FIXME: Export correct TS interface
        const error: any = submitOrderError || finalizeOrderError;

        if (
            !error ||
            error.type === 'order_finalization_not_required' ||
            error.type === 'payment_cancelled' ||
            error.type === 'payment_invalid_form' ||
            error.type === 'spam_protection_not_completed' ||
            error.type === 'invalid_hosted_form_value'
        ) {
            return null;
        }

        return (
            <ErrorModal
                error={error}
                message={mapSubmitOrderErrorMessage(
                    error,
                    language.translate.bind(language),
                    shouldLocaliseErrorMessages,
                )}
                onClose={this.handleCloseModal}
                title={mapSubmitOrderErrorTitle(error, language.translate.bind(language))}
            />
        );
    }

    private renderEmbeddedSupportErrorModal(): ReactNode {
        const { checkEmbeddedSupport = noop, methods } = this.props;

        try {
            checkEmbeddedSupport(methods.map(({ id }) => id));
        } catch (error) {
            if (error instanceof Error) {
                return <ErrorModal error={error} onClose={this.handleCloseModal} />;
            }
        }

        return null;
    }

    private disableSubmit: (method: PaymentMethod, disabled?: boolean) => void = (
        method,
        disabled = true,
    ) => {
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

    private hidePaymentSubmitButton: (method: PaymentMethod, disabled?: boolean) => void = (
        method,
        disabled = true,
    ) => {
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
    private handleBeforeUnload: (event: BeforeUnloadEvent) => string | undefined = (event) => {
        const { defaultMethod, isSubmittingOrder, language } = this.props;
        const { selectedMethod = defaultMethod } = this.state;

        // TODO: Perhaps there is a better way to handle `adyen`, `afterpay`, `amazonpay`,
        // `checkout.com`, `converge`, `sagepay`, `stripev3` and `sezzle`. They require
        //  a redirection to another website during the payment flow but are not
        //  categorised as hosted payment methods.
        if (
            !isSubmittingOrder ||
            !selectedMethod ||
            selectedMethod.type === PaymentMethodProviderType.Hosted ||
            selectedMethod.type === PaymentMethodProviderType.PPSDK ||
            selectedMethod.gateway === PaymentMethodId.BlueSnapDirect ||
            selectedMethod.id === PaymentMethodId.AmazonPay ||
            selectedMethod.id === PaymentMethodId.CBAMPGS ||
            selectedMethod.id === PaymentMethodId.Checkoutcom ||
            selectedMethod.id === PaymentMethodId.CheckoutcomGooglePay ||
            selectedMethod.id === PaymentMethodId.Converge ||
            selectedMethod.id === PaymentMethodId.Humm ||
            selectedMethod.id === PaymentMethodId.Laybuy ||
            selectedMethod.id === PaymentMethodId.Opy ||
            selectedMethod.id === PaymentMethodId.Quadpay ||
            selectedMethod.id === PaymentMethodId.SagePay ||
            selectedMethod.id === PaymentMethodId.Sezzle ||
            selectedMethod.id === PaymentMethodId.WorldpayAccess ||
            selectedMethod.id === PaymentMethodId.Zip ||
            selectedMethod.gateway === PaymentMethodId.AdyenV2 ||
            selectedMethod.gateway === PaymentMethodId.AdyenV2GooglePay ||
            selectedMethod.gateway === PaymentMethodId.AdyenV3 ||
            selectedMethod.gateway === PaymentMethodId.AdyenV3GooglePay ||
            selectedMethod.gateway === PaymentMethodId.Afterpay ||
            selectedMethod.gateway === PaymentMethodId.Clearpay ||
            selectedMethod.gateway === PaymentMethodId.Checkoutcom ||
            selectedMethod.gateway === PaymentMethodId.Mollie ||
            selectedMethod.gateway === PaymentMethodId.StripeV3
        ) {
            return;
        }

        const message = language.translate('common.leave_warning');

        event.returnValue = message;

        return message;
    };

    private handleCloseModal: (event: Event, props: ErrorModalOnCloseProps) => Promise<void> =
        async (_, { error }) => {
            if (!error) {
                return;
            }

            const { cartUrl, clearError, loadCheckout } = this.props;
            const { type: errorType } = error as any; // FIXME: Export correct TS interface

            if (
                errorType === 'provider_fatal_error' ||
                errorType === 'order_could_not_be_finalized_error'
            ) {
                window.location.replace(cartUrl || '/');
            }

            if (errorType === 'tax_provider_unavailable') {
                window.location.reload();
            }

            if (errorType === 'cart_consistency') {
                await loadCheckout();
            }

            if (isErrorWithType(error) && error.body) {
                const { body, headers, status } = error;

                if (body.type === 'provider_error' && headers.location) {
                    window.top?.location.assign(headers.location);
                }

                // Reload the checkout object to get the latest `shouldExecuteSpamCheck` value,
                // which will in turn make `SpamProtectionField` visible again.
                // NOTE: As a temporary fix, we're checking the status code instead of the error
                // type because of an issue with Nginx config, which causes the server to return
                // HTML page instead of JSON response when there is a 429 error.
                if (
                    status === 429 ||
                    body.type === 'spam_protection_expired' ||
                    body.type === 'spam_protection_failed'
                ) {
                    this.setState({ didExceedSpamLimit: true });

                    await loadCheckout();
                }
            }

            clearError(error);
        };

    private handleStoreCreditChange: (useStoreCredit: boolean) => void = async (useStoreCredit) => {
        const { applyStoreCredit, onUnhandledError = noop } = this.props;

        try {
            await applyStoreCredit(useStoreCredit);
        } catch (e) {
            onUnhandledError(e);
        }
    };

    private handleError: (error: Error) => void = (error: Error) => {
        const { onUnhandledError = noop, errorLogger } = this.props;

        const { type } = error as any;

        if (type === 'unexpected_detachment') {
            errorLogger.log(error);

            return;
        }

        return onUnhandledError(error);
    };

    private handleSubmit: (values: PaymentFormValues) => void = async (values) => {
        const {
            defaultMethod,
            loadPaymentMethods,
            isPaymentDataRequired,
            onCartChangedError = noop,
            onSubmit = noop,
            onSubmitError = noop,
            submitOrder,
            analyticsTracker
        } = this.props;

        const { selectedMethod = defaultMethod, submitFunctions } = this.state;

        analyticsTracker.clickPayButton({shouldCreateAccount: values.shouldCreateAccount});

        const customSubmit =
            selectedMethod &&
            submitFunctions[getUniquePaymentMethodId(selectedMethod.id, selectedMethod.gateway)];

        if (customSubmit) {
            return customSubmit(values);
        }

        try {
            const state = await submitOrder(mapToOrderRequestBody(values, isPaymentDataRequired()));
            const order = state.data.getOrder();

            analyticsTracker.paymentComplete();

            onSubmit(order?.orderId);
        } catch (error) {
            analyticsTracker.paymentRejected();

            if (isErrorWithType(error) && error.type === 'payment_method_invalid') {
                return loadPaymentMethods();
            }

            if (isCartChangedError(error)) {
                return onCartChangedError(error);
            }

            onSubmitError(error);
        }
    };

    private setSelectedMethod: (method?: PaymentMethod) => void = (method) => {
        const { selectedMethod } = this.state;

        if (selectedMethod === method) {
            return;
        }

        if (method) {
            this.trackSelectedPaymentMethod(method);
        }

        this.setState({ selectedMethod: method });
    };

    private setSubmit: (
        method: PaymentMethod,
        fn: (values: PaymentFormValues) => void | null,
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
        schema: ObjectSchema<Partial<PaymentFormValues>> | null,
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

    private trackSelectedPaymentMethod(method: PaymentMethod) {
        const { analyticsTracker } = this.props;

        const methodName = method.config.displayName || method.id;
        const methodId = method.id;

        analyticsTracker.selectedPaymentMethod(methodName, methodId);
    }

    private async loadPaymentMethodsOrThrow(): Promise<void> {
        const {
            loadPaymentMethods,
            onUnhandledError = noop,
        } = this.props;

        try {
            await loadPaymentMethods();

            const selectedMethod = this.state.selectedMethod || this.props.defaultMethod;

            if (selectedMethod) {
                this.trackSelectedPaymentMethod(selectedMethod);
            }
        } catch (error) {
            onUnhandledError(error);
        }
    }

    private async handleCartTotalChange(): Promise<void> {
        const { isReady } = this.state;

        if (!isReady) {
            return;
        }

        this.setState({ isReady: false });

        await this.loadPaymentMethodsOrThrow();

        this.setState({ isReady: true });
    }
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
            getPaymentProviderCustomer,
        },
        errors: { getFinalizeOrderError, getSubmitOrderError },
        statuses: { isInitializingPayment, isSubmittingOrder },
    } = checkoutState;

    const checkout = getCheckout();
    const config = getConfig();
    const customer = getCustomer();
    const consignments = getConsignments();
    const paymentProviderCustomer = getPaymentProviderCustomer();

    const { isComplete = false } = getOrder() || {};
    let methods = getPaymentMethods() || EMPTY_ARRAY;

    // TODO: In accordance with the checkout team, this functionality is temporary and will be implemented in the backend instead.
    if (paymentProviderCustomer?.stripeLinkAuthenticationState) {
        const stripeUpePaymentMethod = methods.filter(method =>
            method.id === 'card' && method.gateway === PaymentMethodId.StripeUPE
        );

        methods = stripeUpePaymentMethod.length ? stripeUpePaymentMethod : methods;
    }

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
    const selectedPayment = find(checkout.payments, {
        providerType: PaymentMethodProviderType.Hosted,
    });

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
        ];

        filteredMethods = methods.filter((method: PaymentMethod) => {
            return multiShippingIncompatibleMethodIds.indexOf(method.id) === -1;
        });
    }

    if (selectedPayment) {
        selectedPaymentMethod = getPaymentMethod(
            selectedPayment.providerId,
            selectedPayment.gatewayId,
        );
        filteredMethods = selectedPaymentMethod
            ? compact([selectedPaymentMethod])
            : filteredMethods;
    } else {
        selectedPaymentMethod = find(filteredMethods, {
            config: { hasDefaultStoredInstrument: true },
        });
        // eslint-disable-next-line no-self-assign
        filteredMethods = filteredMethods;
    }

    return {
        applyStoreCredit: checkoutService.applyStoreCredit,
        availableStoreCredit: customer.storeCredit,
        cartUrl: config.links.cartLink,
        clearError: checkoutService.clearError,
        defaultMethod: selectedPaymentMethod || filteredMethods[0],
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
        shouldLocaliseErrorMessages:
            features['PAYMENTS-6799.localise_checkout_payment_error_messages'],
        submitOrder: checkoutService.submitOrder,
        submitOrderError: getSubmitOrderError(),
        checkoutServiceSubscribe: checkoutService.subscribe,
        termsConditionsText:
            isTermsConditionsRequired && termsConditionsType === TermsConditionsType.TextArea
                ? termsCondtitionsText
                : undefined,
        termsConditionsUrl:
            isTermsConditionsRequired && termsConditionsType === TermsConditionsType.Link
                ? termsCondtitionsUrl
                : undefined,
        usableStoreCredit:
            checkout.grandTotal > 0 ? Math.min(checkout.grandTotal, customer.storeCredit || 0) : 0,
    };
}

export default withAnalytics(withLanguage(withCheckout(mapToPaymentProps)(Payment)));
