import { CheckoutSelectors, OrderRequestBody, PaymentMethod } from '@bigcommerce/checkout-sdk';
import { memoizeOne } from '@bigcommerce/memoize';
import { compact, find, isEmpty, noop } from 'lodash';
import React, { Component, ReactNode } from 'react';
import { ObjectSchema } from 'yup';

import { withCheckout, CheckoutContextProps } from '../checkout';
import { isRequestError, ErrorModal, ErrorModalOnCloseProps } from '../common/error';
import { EMPTY_ARRAY } from '../common/utility';
import { withLanguage, WithLanguageProps } from '../locale';
import { FlashAlert, FlashMessage } from '../ui/alert';
import { LoadingOverlay } from '../ui/loading';

import mapSubmitOrderErrorMessage, { mapSubmitOrderErrorTitle } from './mapSubmitOrderErrorMessage';
import mapToOrderRequestBody from './mapToOrderRequestBody';
import { getUniquePaymentMethodId, PaymentMethodId, PaymentMethodProviderType } from './paymentMethod';
import PaymentContext from './PaymentContext';
import PaymentForm, { PaymentFormValues } from './PaymentForm';
import { TermsConditionsType } from './TermsConditionsField';

export interface PaymentProps {
    isEmbedded?: boolean;
    isUsingMultiShipping?: boolean;
    flashMessages?: FlashMessage[]; // TODO: Remove once we can read flash messages from SDK
    checkEmbeddedSupport?(methodIds: string[]): void; // TODO: We're currently doing this check in multiple places, perhaps we should move it up so this check get be done in a single place instead.
    onCartChangedError?(error: Error): void;
    onFinalize?(): void;
    onFinalizeError?(error: Error): void;
    onReady?(): void;
    onStoreCreditChange?(useStoreCredit?: boolean): void;
    onSubmit?(): void;
    onSubmitError?(error: Error): void;
    onUnhandledError?(error: Error): void;
}

interface WithCheckoutPaymentProps {
    availableStoreCredit: number;
    cartUrl: string;
    defaultMethod?: PaymentMethod;
    finalizeOrderError?: Error;
    isSpamProtectionEnabled: boolean;
    isSubmittingOrder: boolean;
    isTermsConditionsRequired: boolean;
    methods: PaymentMethod[];
    submitOrderError?: Error;
    termsConditionsText?: string;
    termsConditionsUrl?: string;
    usableStoreCredit: number;
    clearError(error: Error): void;
    finalizeOrderIfNeeded(): Promise<CheckoutSelectors>;
    isPaymentDataRequired(useStoreCredit?: boolean): boolean;
    loadPaymentMethods(): Promise<CheckoutSelectors>;
    submitOrder(values: OrderRequestBody): Promise<CheckoutSelectors>;
}

interface PaymentState {
    isReady: boolean;
    selectedMethod?: PaymentMethod;
    shouldDisableSubmit: { [key: string]: boolean };
    submitFunctions: { [key: string]: ((values: PaymentFormValues) => void) | null };
    validationSchemas: { [key: string]: ObjectSchema<Partial<PaymentFormValues>> | null };
}

class Payment extends Component<PaymentProps & WithCheckoutPaymentProps & WithLanguageProps, PaymentState> {
    state: PaymentState = {
        isReady: false,
        shouldDisableSubmit: {},
        validationSchemas: {},
        submitFunctions: {},
    };

    private getContextValue = memoizeOne(() => {
        return {
            disableSubmit: this.disableSubmit,
            setSubmit: this.setSubmit,
            setValidationSchema: this.setValidationSchema,
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
                return onFinalizeError(error);
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
            flashMessages = [],
            isUsingMultiShipping,
            methods,
            onStoreCreditChange,
            ...rest
        } = this.props;

        const {
            isReady,
            selectedMethod = defaultMethod,
            shouldDisableSubmit,
            validationSchemas,
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
                    { flashMessages.map(message =>
                        <FlashAlert
                            key={ message.message }
                            message={ message }
                        />
                    ) }

                    { !isEmpty(methods) && defaultMethod && <PaymentForm
                        { ...rest }
                        defaultGatewayId={ defaultMethod.gateway }
                        defaultMethodId={ defaultMethod.id }
                        isUsingMultiShipping={ isUsingMultiShipping }
                        methods={ methods }
                        onMethodSelect={ this.setSelectedMethod }
                        onStoreCreditChange={ onStoreCreditChange }
                        onSubmit={ this.handleSubmit }
                        selectedMethod={ selectedMethod }
                        shouldDisableSubmit={ uniqueSelectedMethodId && shouldDisableSubmit[uniqueSelectedMethodId] || undefined }
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
            submitOrderError,
        } = this.props;

        // FIXME: Export correct TS interface
        const error: any = submitOrderError || finalizeOrderError;

        if (!error ||
            error.type === 'order_finalization_not_required' ||
            error.type === 'payment_cancelled' ||
            error.type === 'spam_protection_not_completed') {
            return null;
        }

        return (
            <ErrorModal
                error={ error }
                message={ mapSubmitOrderErrorMessage(error, language.translate.bind(language)) }
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

    private handleBeforeUnload: (event: BeforeUnloadEvent) => string | undefined = event => {
        const { defaultMethod, isSubmittingOrder, language } = this.props;
        const { selectedMethod = defaultMethod } = this.state;

        // TODO: Perhaps there is a better way to handle `adyen`, `afterpay`, `amazon`,
        // `converge` and `sagepay``. They require a redirection to another website
        // during the payment flow but are not categorised as hosted payment methods.
        if (!isSubmittingOrder ||
            !selectedMethod ||
            selectedMethod.type === PaymentMethodProviderType.Hosted ||
            selectedMethod.id === PaymentMethodId.Amazon ||
            selectedMethod.id === PaymentMethodId.Converge ||
            selectedMethod.id === PaymentMethodId.SagePay ||
            selectedMethod.gateway === PaymentMethodId.AdyenV2 ||
            selectedMethod.gateway === PaymentMethodId.Afterpay) {
            return;
        }

        const message = language.translate('common.leave_warning');

        event.returnValue = message;

        return message;
    };

    private handleCloseModal: (
        event: Event,
        props: ErrorModalOnCloseProps
    ) => void = (_, { error }) => {
        if (!error) {
            return;
        }

        const { cartUrl, clearError } = this.props;
        const { type: errorType } = error as any; // FIXME: Export correct TS interface

        if (errorType === 'provider_fatal_error' ||
            errorType === 'order_could_not_be_finalized_error') {
            window.location.replace(cartUrl || '/');
        }

        if (isRequestError(error)) {
            const { body, headers } = error;

            if (body.type === 'provider_error' && headers.location) {
                window.top.location.assign(headers.location);
            }
        }

        clearError(error);
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
            await submitOrder(mapToOrderRequestBody(values, isPaymentDataRequired(values.useStoreCredit)));
            onSubmit();
        } catch (error) {
            if (error.type === 'payment_method_invalid') {
                return loadPaymentMethods();
            }

            if (error.type === 'cart_changed') {
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
            getPaymentMethod,
            getPaymentMethods,
            isPaymentDataRequired,
        },
        errors: {
            getFinalizeOrderError,
            getSubmitOrderError,
        },
        statuses: { isSubmittingOrder },
    } = checkoutState;

    const checkout = getCheckout();
    const config = getConfig();
    const customer = getCustomer();
    const methods = getPaymentMethods() || EMPTY_ARRAY;

    if (!checkout || !config || !customer) {
        return null;
    }

    const {
        isSpamProtectionEnabled,
        enableTermsAndConditions: isTermsConditionsRequired,
        orderTermsAndConditionsType: termsConditionsType,
        orderTermsAndConditions: termsCondtitionsText,
        orderTermsAndConditionsLink: termsCondtitionsUrl,
    } = config.checkoutSettings;

    const selectedPayment = find(checkout.payments, { providerType: PaymentMethodProviderType.Hosted });
    const selectedPaymentMethod = selectedPayment ? getPaymentMethod(selectedPayment.providerId, selectedPayment.gatewayId) : undefined;
    const filteredMethods = selectedPaymentMethod ? compact([selectedPaymentMethod]) : methods;

    return {
        availableStoreCredit: customer.storeCredit,
        cartUrl: config.links.cartLink,
        clearError: checkoutService.clearError,
        defaultMethod: selectedPaymentMethod ? selectedPaymentMethod : filteredMethods[0],
        finalizeOrderError: getFinalizeOrderError(),
        finalizeOrderIfNeeded: checkoutService.finalizeOrderIfNeeded,
        isPaymentDataRequired,
        isSubmittingOrder: isSubmittingOrder(),
        isSpamProtectionEnabled,
        isTermsConditionsRequired,
        loadPaymentMethods: checkoutService.loadPaymentMethods,
        methods: filteredMethods,
        submitOrder: checkoutService.submitOrder,
        submitOrderError: getSubmitOrderError(),
        termsConditionsText: isTermsConditionsRequired && termsConditionsType === TermsConditionsType.TextArea ?
            termsCondtitionsText :
            undefined,
        termsConditionsUrl: isTermsConditionsRequired && termsConditionsType === TermsConditionsType.Link ?
            termsCondtitionsUrl :
            undefined,
        usableStoreCredit: Math.min(checkout.grandTotal, customer.storeCredit || 0),
    };
}

export default withLanguage(withCheckout(mapToPaymentProps)(Payment));
