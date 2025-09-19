import {
    type CartChangedError,
    type CheckoutSelectors,
    type CheckoutService,
    type CheckoutSettings,
    type OrderRequestBody,
    type PaymentMethod,
} from '@bigcommerce/checkout-sdk';
import { compact, find, isEmpty, noop } from 'lodash';
import React, { type ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type ObjectSchema } from 'yup';

import { type AnalyticsContextProps } from '@bigcommerce/checkout/analytics';
import { type ErrorLogger } from '@bigcommerce/checkout/error-handling-utils';
import { withLanguage, type WithLanguageProps } from '@bigcommerce/checkout/locale';
import { type CheckoutContextProps, type PaymentFormValues } from '@bigcommerce/checkout/payment-integration-api';
import { ChecklistSkeleton } from '@bigcommerce/checkout/ui';

import { withAnalytics } from '../../analytics';
import { withCheckout } from '../../checkout';
import {
    type ErrorModalOnCloseProps,
    isCartChangedError,
    isErrorWithType,
} from '../../common/error';
import { EMPTY_ARRAY } from '../../common/utility';
import { TermsConditionsType } from '../../termsConditions';
import mapToOrderRequestBody from '../mapToOrderRequestBody';
import PaymentContext from '../PaymentContext';
import PaymentForm from '../PaymentForm';
import {
    getUniquePaymentMethodId,
    PaymentMethodId,
    PaymentMethodProviderType,
} from '../paymentMethod';

import { EmbeddedSupportErrorModal } from './EmbeddedSupportErrorModa';
import { OrderErrorModal } from './OrderErrorModal';

export interface PaymentProps {
    errorLogger: ErrorLogger;
    isEmbedded?: boolean;
    isUsingMultiShipping?: boolean;
    checkEmbeddedSupport?(methodIds: string[]): void;
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

interface PaymentStateLike {
    didExceedSpamLimit: boolean;
    isReady: boolean;
    selectedMethod?: PaymentMethod;
    shouldDisableSubmit: { [key: string]: boolean };
    shouldHidePaymentSubmitButton: { [key: string]: boolean };
    submitFunctions: { [key: string]: ((values: PaymentFormValues) => void) | null };
    validationSchemas: { [key: string]: ObjectSchema<Partial<PaymentFormValues>> | null };
}

const Payment = (
    props: PaymentProps & WithCheckoutPaymentProps & WithLanguageProps & AnalyticsContextProps,
): ReactElement => {
    const {
        finalizeOrderIfNeeded,
        onFinalize = noop,
        onFinalizeError = noop,
        onReady = noop,
        usableStoreCredit,
        checkoutServiceSubscribe,
        defaultMethod,
        finalizeOrderError,
        isInitializingPayment,
        isUsingMultiShipping,
        methods,
        applyStoreCredit,
        shouldLocaliseErrorMessages,
        submitOrderError,
        cartUrl,
        clearError,
        loadCheckout,
        loadPaymentMethods,
        submitOrder,
        isPaymentDataRequired,
        onCartChangedError = noop,
        onSubmit = noop,
        onSubmitError = noop,
        onUnhandledError = noop,
        isSubmittingOrder,
        language,
        checkEmbeddedSupport = noop,
        analyticsTracker,
        ...rest
    } = props;

    const [didExceedSpamLimit, setDidExceedSpamLimit] = useState<PaymentStateLike['didExceedSpamLimit']>(false);
    const [isReady, setIsReady] = useState<PaymentStateLike['isReady']>(false);
    const [selectedMethod, setSelectedMethodState] = useState<PaymentStateLike['selectedMethod']>();
    const [shouldDisableSubmit, setShouldDisableSubmit] = useState<PaymentStateLike['shouldDisableSubmit']>({});
    const [shouldHidePaymentSubmitButton, setShouldHidePaymentSubmitButton] = useState<PaymentStateLike['shouldHidePaymentSubmitButton']>({});
    const [submitFunctions, setSubmitFunctions] = useState<PaymentStateLike['submitFunctions']>({});
    const [validationSchemas, setValidationSchemas] = useState<PaymentStateLike['validationSchemas']>({});

    const grandTotalChangeUnsubscribeRef = useRef<(() => void) | undefined>();
    const selectedMethodRef = useRef<PaymentMethod | undefined>(selectedMethod);
    const isSubmittingOrderRef = useRef<boolean>(isSubmittingOrder);
    const isReadyRef = useRef<boolean>(isReady);

    useEffect(() => { selectedMethodRef.current = selectedMethod; }, [selectedMethod]);
    useEffect(() => { isSubmittingOrderRef.current = isSubmittingOrder; }, [isSubmittingOrder]);
    useEffect(() => { isReadyRef.current = isReady; }, [isReady]);

    const trackSelectedPaymentMethod = useCallback((method: PaymentMethod) => {
        const methodName = method.config.displayName || method.id;

        analyticsTracker.selectedPaymentMethod(methodName, method.id);
    }, [analyticsTracker]);

    const loadPaymentMethodsOrThrow = useCallback(async () => {
        try {
            await loadPaymentMethods();

            const method = selectedMethodRef.current || defaultMethod;

            if (method) {
                trackSelectedPaymentMethod(method);
            }
        } catch (error) {
            onUnhandledError(error as Error);
        }
    }, [loadPaymentMethods, defaultMethod, onUnhandledError, trackSelectedPaymentMethod]);

    const handleCartTotalChange = useCallback(async () => {
        if (!isReadyRef.current) {
            return;
        }

        setIsReady(false);
        await loadPaymentMethodsOrThrow();
        setIsReady(true);
    }, [loadPaymentMethodsOrThrow]);

    const handleStoreCreditChange = useCallback(async (useStoreCredit: boolean) => {
        try {
            await applyStoreCredit(useStoreCredit);
        } catch (e) {
            onUnhandledError(e as Error);
        }
    }, [applyStoreCredit, onUnhandledError]);

    const handleError = useCallback((error: Error) => {
        const { type } = error as any;

        if (type === 'unexpected_detachment') {
            props.errorLogger.log(error);

            return;
        }

        onUnhandledError(error);
    }, [onUnhandledError, props.errorLogger]);

    const setSelectedMethod = useCallback((method?: PaymentMethod) => {
        if (selectedMethodRef.current === method) {
            return;
        }

        if (method) {
            trackSelectedPaymentMethod(method);
        }

        setSelectedMethodState(method);
    }, [trackSelectedPaymentMethod]);

    const setSubmit = useCallback((method: PaymentMethod, fn: (values: PaymentFormValues) => void | null) => {
        const uniqueId = getUniquePaymentMethodId(method.id, method.gateway);

        setSubmitFunctions(prev => {
            if (prev[uniqueId] === fn) {
                return prev;
            }

            return { ...prev, [uniqueId]: fn };
        });
    }, []);

    const setValidationSchema = useCallback((method: PaymentMethod, schema: ObjectSchema<Partial<PaymentFormValues>> | null) => {
        const uniqueId = getUniquePaymentMethodId(method.id, method.gateway);

        setValidationSchemas(prev => {
            if (prev[uniqueId] === schema) {
                return prev;
            }

            return { ...prev, [uniqueId]: schema };
        });
    }, []);

    const disableSubmit = useCallback((method: PaymentMethod, disabled = true) => {
        const uniqueId = getUniquePaymentMethodId(method.id, method.gateway);

        setShouldDisableSubmit(prev => {
            if (prev[uniqueId] === disabled) {
                return prev;
            }

            return { ...prev, [uniqueId]: disabled };
        });
    }, []);

    const hidePaymentSubmitButton = useCallback((method: PaymentMethod, disabled = true) => {
        const uniqueId = getUniquePaymentMethodId(method.id, method.gateway);

        setShouldHidePaymentSubmitButton(prev => {
            if (prev[uniqueId] === disabled) {
                return prev;
            }

            return { ...prev, [uniqueId]: disabled };
        });
    }, []);

    const handleBeforeUnload = useCallback((event: BeforeUnloadEvent) => {
        const currentSelected = selectedMethodRef.current || defaultMethod;

        if (!isSubmittingOrderRef.current || !currentSelected ||
            currentSelected.type === PaymentMethodProviderType.Hosted ||
            currentSelected.type === PaymentMethodProviderType.PPSDK ||
            currentSelected.skipRedirectConfirmationAlert) {
            return;
        }

        const message = language.translate('common.leave_warning');

        event.returnValue = message;

        return message;
    }, [defaultMethod, language]);

    const handleSubmit = useCallback(async (values: PaymentFormValues) => {
        const method = selectedMethodRef.current || defaultMethod;

        analyticsTracker.clickPayButton({ shouldCreateAccount: values.shouldCreateAccount });

        const customSubmit = method && submitFunctions[getUniquePaymentMethodId(method.id, method.gateway)];

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

            onSubmitError(error as Error);
        }
    }, [defaultMethod, submitFunctions, submitOrder, isPaymentDataRequired, onSubmit, onSubmitError, loadPaymentMethods, onCartChangedError, analyticsTracker]);

    const handleCloseModal = useCallback(async (_: Event, { error }: ErrorModalOnCloseProps) => {
        if (!error) {
            return;
        }

        const { type: errorType } = error as any;

        if (errorType === 'provider_fatal_error' || errorType === 'order_could_not_be_finalized_error') {
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

            if (status === 429 || body.type === 'spam_protection_expired' || body.type === 'spam_protection_failed') {
                setDidExceedSpamLimit(true);
                await loadCheckout();
            }
        }

        clearError(error);
    }, [cartUrl, clearError, loadCheckout]);

    const contextValue = useMemo(() => ({
        disableSubmit,
        setSubmit,
        setValidationSchema,
        hidePaymentSubmitButton,
    }), [disableSubmit, setSubmit, setValidationSchema, hidePaymentSubmitButton]);

    useEffect(() => {
        (async () => {
            if (usableStoreCredit) {
                await handleStoreCreditChange(true);
            }

            await loadPaymentMethodsOrThrow();

            try {
                const state = await finalizeOrderIfNeeded();
                const order = state.data.getOrder();

                onFinalize(order?.orderId);
            } catch (error) {
                if (isErrorWithType(error) && (error as any).type !== 'order_finalization_not_required') {
                    onFinalizeError(error as Error);
                }
            }

            grandTotalChangeUnsubscribeRef.current = checkoutServiceSubscribe(
                () => handleCartTotalChange(),
                ({ data }) => data.getCheckout()?.grandTotal,
                ({ data }) => data.getCheckout()?.outstandingBalance,
            );
            window.addEventListener('beforeunload', handleBeforeUnload);
            setIsReady(true);
            onReady();
        })();

        return () => {
            if (grandTotalChangeUnsubscribeRef.current) {
                grandTotalChangeUnsubscribeRef.current();
                grandTotalChangeUnsubscribeRef.current = undefined;
            }

            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []); // run once

    const didMountRef = useRef(false);

    useEffect(() => {
        if (didMountRef.current) {
            checkEmbeddedSupport(methods.map(({ id }) => id));
        } else {
            didMountRef.current = true;
        }
    }, [methods, checkEmbeddedSupport]);

    const uniqueSelectedMethodId = selectedMethod && getUniquePaymentMethodId(selectedMethod.id, selectedMethod.gateway);

    return (
        <PaymentContext.Provider value={contextValue}>
            <ChecklistSkeleton isLoading={!isReady}>
                {!isEmpty(methods) && defaultMethod && (
                    <PaymentForm
                        {...rest}
                        defaultGatewayId={defaultMethod.gateway}
                        defaultMethodId={defaultMethod.id}
                        didExceedSpamLimit={didExceedSpamLimit}
                        isInitializingPayment={isInitializingPayment}
                        isPaymentDataRequired={isPaymentDataRequired}
                        isUsingMultiShipping={isUsingMultiShipping}
                        methods={methods}
                        onMethodSelect={setSelectedMethod}
                        onStoreCreditChange={handleStoreCreditChange}
                        onSubmit={handleSubmit}
                        onUnhandledError={handleError}
                        selectedMethod={selectedMethod}
                        shouldDisableSubmit={(uniqueSelectedMethodId && shouldDisableSubmit[uniqueSelectedMethodId]) || undefined}
                        shouldHidePaymentSubmitButton={(uniqueSelectedMethodId && isPaymentDataRequired() && shouldHidePaymentSubmitButton[uniqueSelectedMethodId]) || undefined}
                        validationSchema={(uniqueSelectedMethodId && validationSchemas[uniqueSelectedMethodId]) || undefined}
                    />
                )}
            </ChecklistSkeleton>

            <OrderErrorModal
                finalizeOrderError={finalizeOrderError}
                language={language}
                onClose={handleCloseModal}
                shouldLocaliseErrorMessages={shouldLocaliseErrorMessages}
                submitOrderError={submitOrderError}
            />

            <EmbeddedSupportErrorModal
                checkEmbeddedSupport={checkEmbeddedSupport}
                methods={methods}
                onClose={handleCloseModal}
            />
        </PaymentContext.Provider>
    );
};

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
            return Boolean(method.initializationData.showInCheckout);
        }

        return method.id !== PaymentMethodId.BraintreeLocalPaymentMethod;


    });

    if (consignments && consignments.length > 1) {
        const multiShippingIncompatibleMethodIds: string[] = [
            PaymentMethodId.AmazonPay,
        ];

        filteredMethods = methods.filter((method: PaymentMethod) => {
            return !multiShippingIncompatibleMethodIds.includes(method.id);
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
