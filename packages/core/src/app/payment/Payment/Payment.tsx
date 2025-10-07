import {
    type CartChangedError,
    type CheckoutSettings,
    type PaymentMethod,
} from '@bigcommerce/checkout-sdk';
import { isEmpty, noop } from 'lodash';
import React, { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type ObjectSchema } from 'yup';

import { useAnalytics } from '@bigcommerce/checkout/analytics';
import { type ErrorLogger } from '@bigcommerce/checkout/error-handling-utils';
import { useLocale } from '@bigcommerce/checkout/locale';
import { type PaymentFormValues, useCheckout } from '@bigcommerce/checkout/payment-integration-api';
import { ChecklistSkeleton } from '@bigcommerce/checkout/ui';

import {
    type ErrorModalOnCloseProps,
    isCartChangedError,
    isErrorWithType,
} from '../../common/error';
import { TermsConditionsType } from '../../termsConditions';
import mapToOrderRequestBody from '../mapToOrderRequestBody';
import PaymentContext from '../PaymentContext';
import PaymentForm from '../PaymentForm';
import {
    getUniquePaymentMethodId,
    PaymentMethodProviderType,
} from '../paymentMethod';

import { EmbeddedSupportErrorModal } from './EmbeddedSupportErrorModa';
import { getDefaultPaymentMethodAndFilteredMethods } from './getDefaultPaymentMethodAndFilteredMethods';
import { OrderErrorModal } from './OrderErrorModal';

interface PaymentProps {
    errorLogger: ErrorLogger;
    isEmbedded?: boolean;
    isUsingMultiShipping?: boolean;
    checkEmbeddedSupport?(methodIds: string[]): void;
    onCartChangedError?(error: CartChangedError): void;
    onFinalize?(orderId?: number): void;
    onFinalizeError?(error: Error): void;
    onReady?(): void;
    onSubmit?(orderId?: number): void;
    onSubmitError?(error: Error): void;
    onUnhandledError?(error: Error): void;
}

const Payment = (
    {
        errorLogger,
        onFinalize = noop,
        onFinalizeError = noop,
        onReady = noop,
        isEmbedded,
        isUsingMultiShipping,
        onCartChangedError = noop,
        onSubmit = noop,
        onSubmitError = noop,
        onUnhandledError = noop,
        checkEmbeddedSupport = noop,
    }: PaymentProps,
): ReactNode => {
    const [didExceedSpamLimit, setDidExceedSpamLimit] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [selectedMethod, setSelectedMethodState] = useState<PaymentMethod | undefined>();
    const [shouldDisableSubmit, setShouldDisableSubmit] = useState<Record<string, boolean>>({});
    const [shouldHidePaymentSubmitButton, setShouldHidePaymentSubmitButton] = useState<Record<string, boolean>>({});
    const [submitFunctions, setSubmitFunctions] = useState<Record<string, ((values: PaymentFormValues) => void) | null>>({});
    const [validationSchemas, setValidationSchemas] = useState<Record<string, ObjectSchema<Partial<PaymentFormValues>> | null>>({});

    const componentDidMountRef = useRef(false);
    const grandTotalChangeUnsubscribeRef = useRef<(() => void) | undefined>();

    const { checkoutState, checkoutService } = useCheckout();
    const { analyticsTracker } = useAnalytics();
    const { language } = useLocale();

    const {
        data: {
            getCheckout,
            getCustomer,
            getConfig,
            isPaymentDataRequired,
            getPaymentMethod,
            getPaymentMethods,
            getConsignments,
            getPaymentProviderCustomer,
            getOrder,
        },
        errors: { getFinalizeOrderError,  getSubmitOrderError },
        statuses: { isInitializingPayment: getIsInitializingPayment, isSubmittingOrder: getIsSubmittingOrder },
    } = checkoutState;
    const {
        clearError,
        finalizeOrderIfNeeded,
        loadCheckout,
        loadPaymentMethods,
        submitOrder,
        subscribe: checkoutServiceSubscribe,
    } = checkoutService;
    const checkout = getCheckout();
    const customer = getCustomer();
    const config = getConfig();
    const consignments = getConsignments();
    const paymentProviderCustomer = getPaymentProviderCustomer();
    const { isComplete = false } = getOrder() || {};

    if (!checkout || !customer || !config || !consignments) {
        throw new Error('Checkout data is not available');
    }

    const paymentMethods = getPaymentMethods();
    const { defaultMethod, methods } = useMemo(()=>getDefaultPaymentMethodAndFilteredMethods(
        checkout,
        consignments,
        paymentProviderCustomer,
        getPaymentMethod,
        paymentMethods,
    ),[paymentMethods, paymentProviderCustomer]);

    const { isStoreCreditApplied, shouldExecuteSpamCheck } = checkout;
    const applyStoreCredit = checkoutService.applyStoreCredit;
    const availableStoreCredit = customer.storeCredit;
    const cartUrl = config.links.cartLink;
    const finalizeOrderError = getFinalizeOrderError();
    const isInitializingPayment = getIsInitializingPayment();
    const isSubmittingOrder = getIsSubmittingOrder();
    const {
        enableTermsAndConditions,
        orderTermsAndConditions,
        orderTermsAndConditionsType: termsConditionsType,
        orderTermsAndConditionsLink: termsCondtitionsUrl,
    } = config.checkoutSettings as CheckoutSettings & { orderTermsAndConditionsLocation: string };
    const isTermsConditionsRequired = enableTermsAndConditions;
    const submitOrderError = getSubmitOrderError();
    const termsConditionsText =
        isTermsConditionsRequired && termsConditionsType === TermsConditionsType.TextArea
            ? orderTermsAndConditions
            : undefined;
    const termsConditionsUrl =
        isTermsConditionsRequired && termsConditionsType === TermsConditionsType.Link
            ? termsCondtitionsUrl
            : undefined;
    const usableStoreCredit =
        checkout.grandTotal > 0 ? Math.min(checkout.grandTotal, customer.storeCredit || 0) : 0;

    const trackSelectedPaymentMethod = useCallback((method: PaymentMethod) => {
        const methodName = method.config.displayName || method.id;

        analyticsTracker.selectedPaymentMethod(methodName, method.id);
    }, []);

    const loadPaymentMethodsOrThrow = useCallback(async () => {
        try {
            await loadPaymentMethods();

            const method = selectedMethod || defaultMethod;

            if (method) {
                trackSelectedPaymentMethod(method);
            }
        } catch (error) {
            onUnhandledError(error as Error);
        }
    }, [defaultMethod, selectedMethod]);

    const handleCartTotalChange = useCallback(async () => {
        if (!isReady) {
            return;
        }

        setIsReady(false);
        await loadPaymentMethodsOrThrow();
        setIsReady(true);
    }, [isReady]);

    const handleStoreCreditChange = useCallback(async (useStoreCredit: boolean) => {
        try {
            await applyStoreCredit(useStoreCredit);
        } catch (e) {
            onUnhandledError(e as Error);
        }
    }, []);

    const handleError = useCallback((error: Error) => {
        const { type } = error as any;

        if (type === 'unexpected_detachment') {
            errorLogger.log(error);

            return;
        }

        onUnhandledError(error);
    }, []);

    const setSelectedMethod = useCallback((method?: PaymentMethod) => {
        if (selectedMethod === method) {
            return;
        }

        if (method) {
            trackSelectedPaymentMethod(method);
        }

        setSelectedMethodState(method);
    }, [selectedMethod]);

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
        const currentSelected = selectedMethod || defaultMethod;

        if (!isSubmittingOrder || !currentSelected ||
            currentSelected.type === PaymentMethodProviderType.Hosted ||
            currentSelected.type === PaymentMethodProviderType.PPSDK ||
            currentSelected.skipRedirectConfirmationAlert) {
            return;
        }

        const message = language.translate('common.leave_warning');

        event.returnValue = message;

        return message;
    }, [defaultMethod, selectedMethod, isSubmittingOrder]);

    const handleSubmit = useCallback(async (values: PaymentFormValues) => {
        const method = selectedMethod || defaultMethod;

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
    }, [defaultMethod, selectedMethod]);

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

        void clearError(error);
    }, []);

    const paymentContextValue = useMemo(() => ({
        disableSubmit,
        setSubmit,
        setValidationSchema,
        hidePaymentSubmitButton,
    }), [disableSubmit, setSubmit, setValidationSchema, hidePaymentSubmitButton]);
    const uniqueSelectedMethodId = selectedMethod && getUniquePaymentMethodId(selectedMethod.id, selectedMethod.gateway);

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
    }, []);

    useEffect(() => {
        if (!componentDidMountRef.current) {
            componentDidMountRef.current = true;

            return;
        }

        checkEmbeddedSupport(methods.map(({ id }) => id));
    }, [methods]);

    if (isComplete) {
        return null;
    }

    return (
        <PaymentContext.Provider value={paymentContextValue}>
            <ChecklistSkeleton isLoading={!isReady}>
                {!isEmpty(methods) && defaultMethod && (
                    <PaymentForm
                        availableStoreCredit={availableStoreCredit}
                        defaultGatewayId={defaultMethod.gateway}
                        defaultMethodId={defaultMethod.id}
                        didExceedSpamLimit={didExceedSpamLimit}
                        isEmbedded={isEmbedded}
                        isInitializingPayment={isInitializingPayment}
                        isPaymentDataRequired={isPaymentDataRequired}
                        isStoreCreditApplied = {isStoreCreditApplied}
                        isTermsConditionsRequired={isTermsConditionsRequired}
                        isUsingMultiShipping={isUsingMultiShipping}
                        methods={methods}
                        onMethodSelect={setSelectedMethod}
                        onStoreCreditChange={handleStoreCreditChange}
                        onSubmit={handleSubmit}
                        onUnhandledError={handleError}
                        selectedMethod={selectedMethod}
                        shouldDisableSubmit={(uniqueSelectedMethodId && shouldDisableSubmit[uniqueSelectedMethodId]) || undefined}
                        shouldExecuteSpamCheck = {shouldExecuteSpamCheck}
                        shouldHidePaymentSubmitButton={(uniqueSelectedMethodId && isPaymentDataRequired() && shouldHidePaymentSubmitButton[uniqueSelectedMethodId]) || undefined}
                        termsConditionsText={termsConditionsText}
                        termsConditionsUrl={termsConditionsUrl}
                        usableStoreCredit={usableStoreCredit}
                        validationSchema={(uniqueSelectedMethodId && validationSchemas[uniqueSelectedMethodId]) || undefined}
                    />
                )}
            </ChecklistSkeleton>

            <OrderErrorModal
                finalizeOrderError={finalizeOrderError}
                language={language}
                onClose={handleCloseModal}
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

export default Payment;
