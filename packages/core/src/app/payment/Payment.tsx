import {
    type Checkout,
    type CheckoutSelectors,
    type CheckoutService,
    type CheckoutSettings,
    type Consignment,
    type OrderFinalizeOptions,
    type OrderRequestBody,
    type PaymentMethod,
    type PaymentProviderCustomer,
} from '@bigcommerce/checkout-sdk';
import { createAfterpayPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/afterpay';
import { createBlueSnapV2PaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/bluesnap-direct';
import { createCBAMPGSPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/cba-mpgs';
import {
  createCheckoutComAPMPaymentStrategy,
  createCheckoutComCreditCardPaymentStrategy,
  createCheckoutComFawryPaymentStrategy,
  createCheckoutComIdealPaymentStrategy,
  createCheckoutComSepaPaymentStrategy,
} from '@bigcommerce/checkout-sdk/integrations/checkoutcom-custom';
import { createClearpayPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/clearpay';
import { createOffsitePaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/offsite';
import { createPaypalExpressPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/paypal-express';
import { createSagePayPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/sagepay';
import { memoizeOne } from '@bigcommerce/memoize';
import { compact, find, isEmpty, noop } from 'lodash';
import React, {
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { type ObjectSchema } from 'yup';

import {
  type AnalyticsContextProps,
  type CheckoutContextProps,
} from '@bigcommerce/checkout/contexts';
import { type ErrorLogger } from '@bigcommerce/checkout/error-handling-utils';
import { withLanguage, type WithLanguageProps } from '@bigcommerce/checkout/locale';
import { type PaymentFormValues } from '@bigcommerce/checkout/payment-integration-api';
import { ChecklistSkeleton } from '@bigcommerce/checkout/ui';

import { withAnalytics } from '../analytics';
import { withCheckout } from '../checkout';
import {
  ErrorModal,
  type ErrorModalOnCloseProps,
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

interface PaymentMethodSelectionParams {
    checkout: Checkout;
    methods: PaymentMethod[];
    consignments?: Consignment[];
    getPaymentMethod: (methodId: string, gatewayId?: string) => PaymentMethod | undefined;
    paymentProviderCustomer?: PaymentProviderCustomer;
}

const getDefaultPaymentMethod = ({
    checkout,
    consignments,
    getPaymentMethod,
    methods,
    paymentProviderCustomer,
}: PaymentMethodSelectionParams): { filteredMethods: PaymentMethod[]; defaultMethod?: PaymentMethod } => {
    let filteredMethods = methods;

    // TODO: In accordance with the checkout team, this functionality is temporary and will be implemented in the backend instead.
    if (paymentProviderCustomer?.stripeLinkAuthenticationState) {
        const stripeUpePaymentMethod = filteredMethods.filter(
            (method) => method.id === 'card' && method.gateway === PaymentMethodId.StripeUPE,
        );

        filteredMethods = stripeUpePaymentMethod.length ? stripeUpePaymentMethod : filteredMethods;
    }

    filteredMethods = filteredMethods.filter((method: PaymentMethod) => {
        if (method.id === PaymentMethodId.Bolt && method.initializationData) {
            return Boolean(method.initializationData.showInCheckout);
        }

        return method.id !== PaymentMethodId.BraintreeLocalPaymentMethod;
    });

    if (consignments && consignments.length > 1) {
        const multiShippingIncompatibleMethodIds: string[] = [
            PaymentMethodId.AmazonPay,
        ];

        filteredMethods = filteredMethods.filter(
            (method: PaymentMethod) => !multiShippingIncompatibleMethodIds.includes(method.id),
        );
    }

    const selectedPayment = checkout.payments
        ? find(checkout.payments, { providerType: PaymentMethodProviderType.Hosted })
        : undefined;
    let selectedPaymentMethod;

    if (selectedPayment) {
        selectedPaymentMethod = getPaymentMethod(
            selectedPayment.providerId,
            selectedPayment.gatewayId,
        );
        filteredMethods = selectedPaymentMethod ? compact([selectedPaymentMethod]) : filteredMethods;
    } else {
        selectedPaymentMethod = find(filteredMethods, {
            config: { hasDefaultStoredInstrument: true },
        });
    }

    return {
        defaultMethod: selectedPaymentMethod || filteredMethods[0],
        filteredMethods,
    };
};

export interface PaymentProps {
  errorLogger: ErrorLogger;
  isEmbedded?: boolean;
  isUsingMultiShipping?: boolean;
  checkEmbeddedSupport?(methodIds: string[]): void; // TODO: We're currently doing this check in multiple places, perhaps we should move it up so this check get be done in a single place instead.
  onCartChangedError?(): void;
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
  finalizeOrderIfNeeded(options: OrderFinalizeOptions): Promise<CheckoutSelectors>;
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
  shouldDisableSubmit: Record<string, boolean>;
  shouldHidePaymentSubmitButton: Record<string, boolean>;
  submitFunctions: Record<string, ((values: PaymentFormValues) => void) | null>;
}

type validationSchemas = Record<string, ObjectSchema<Partial<PaymentFormValues>> | null>;

const Payment = (
  props: PaymentProps & WithCheckoutPaymentProps & WithLanguageProps & AnalyticsContextProps,
): ReactElement => {
  const [state, setState] = useState<PaymentState>({
    didExceedSpamLimit: false,
    isReady: false,
    shouldDisableSubmit: {},
    shouldHidePaymentSubmitButton: {},
    submitFunctions: {},
  });

  const isReadyRef = useRef(state.isReady);
  const grandTotalChangeUnsubscribe = useRef<() => void>();
  const validationSchemasRef = useRef<validationSchemas>({});

  const renderOrderErrorModal = (): ReactNode => {
    const { finalizeOrderError, language, shouldLocaliseErrorMessages, submitOrderError } = props;

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

    const setSelectedMethod = useCallback((method?: PaymentMethod) : void => {
        const { selectedMethod } = state;

        if (selectedMethod === method) {
            return;
        }

        if (method) {
            trackSelectedPaymentMethod(method);
        }

        setState(prevState => ({ ...prevState, selectedMethod: method }));
    }, []);

    const setSubmit = (
        method: PaymentMethod,
        fn: (values: PaymentFormValues) => void | null,
    ): void => {
        const uniqueId = getUniquePaymentMethodId(method.id, method.gateway);
        const { submitFunctions } = state;

        if (submitFunctions[uniqueId] === fn) {
            return;
        }

        setState(prevState => ({ ...prevState,
            submitFunctions: {
                ...submitFunctions,
                [uniqueId]: fn,
            },
        }));
    };

    const setValidationSchema = (
        method: PaymentMethod,
        schema: ObjectSchema<Partial<PaymentFormValues>> | null,
    ): void => {
        const uniqueId = getUniquePaymentMethodId(method.id, method.gateway);

        if (validationSchemasRef.current[uniqueId] === schema) {
            return;
        }

        validationSchemasRef.current[uniqueId] = schema;
    };

    const loadPaymentMethodsOrThrow = async (): Promise<void> => {
        const {
            loadPaymentMethods,
            onUnhandledError = noop,
        } = props;

        try {
            const updatedState = await loadPaymentMethods();
            const checkout = updatedState.data.getCheckout();
            const methods = updatedState.data.getPaymentMethods() || EMPTY_ARRAY;

            const defaultMethod = checkout
                ? getDefaultPaymentMethod({
                      checkout,
                      consignments: updatedState.data.getConsignments(),
                      getPaymentMethod: updatedState.data.getPaymentMethod,
                      methods,
                      paymentProviderCustomer: updatedState.data.getPaymentProviderCustomer(),
                  }).defaultMethod
                : undefined;
            const selectedMethod = state.selectedMethod || defaultMethod;

            if (selectedMethod) {
                trackSelectedPaymentMethod(selectedMethod);
            }
        } catch (error) {
            onUnhandledError(error);
        }
    }

    const handleCartTotalChange = async (): Promise<void> => {
        const isReady = isReadyRef.current;

        if (!isReady) {
            return;
        }

        setState(prevState => ({ ...prevState, isReady: false }));

        await loadPaymentMethodsOrThrow();

        setState(prevState => ({ ...prevState,  isReady: true }));
    }

    const getContextValue = memoizeOne(() => {
        return {
            disableSubmit,
            setSubmit,
            setValidationSchema,
            hidePaymentSubmitButton,
        };
    });

    useEffect(() => {
        isReadyRef.current = state.isReady;
    }, [state.isReady]);

    useEffect(() => {
        const init = async () => {
            const {
                finalizeOrderIfNeeded,
                onFinalize = noop,
                onFinalizeError = noop,
                onReady = noop,
                usableStoreCredit,
                checkoutServiceSubscribe,
            } = props;

            if (usableStoreCredit) {
                await handleStoreCreditChange(true);
            }

            await loadPaymentMethodsOrThrow();

            try {
                const state = await finalizeOrderIfNeeded({
                    integrations: [
                        createAfterpayPaymentStrategy,
                        createBlueSnapV2PaymentStrategy,
                        createCBAMPGSPaymentStrategy,
                        createCheckoutComAPMPaymentStrategy,
                        createCheckoutComCreditCardPaymentStrategy,
                        createCheckoutComFawryPaymentStrategy,
                        createCheckoutComIdealPaymentStrategy,
                        createCheckoutComSepaPaymentStrategy,
                        createClearpayPaymentStrategy,
                        createOffsitePaymentStrategy,
                        createPaypalExpressPaymentStrategy,
                        createSagePayPaymentStrategy,
                    ],
                });
                const order = state.data.getOrder();

                onFinalize(order?.orderId);
            } catch (error) {
                if (isErrorWithType(error) && error.type !== 'order_finalization_not_required') {
                    onFinalizeError(error);
                }
            }

            grandTotalChangeUnsubscribe.current = checkoutServiceSubscribe(
                () => handleCartTotalChange(),
                ({ data }) => data.getCheckout()?.grandTotal,
                ({ data }) => data.getCheckout()?.outstandingBalance,
            );

            window.addEventListener('beforeunload', handleBeforeUnload);
            setState(prevState => ({ ...prevState, isReady: true }));
            onReady();
        }

        void init();

        return () => {
            const deInit = () => {
                if (grandTotalChangeUnsubscribe.current) {
                    grandTotalChangeUnsubscribe.current();
                    grandTotalChangeUnsubscribe.current = undefined;
                }

                window.removeEventListener('beforeunload', handleBeforeUnload);
            }

            deInit();
        }
    }, []);

    useEffect(() => {
        const { checkEmbeddedSupport = noop, methods } = props;

        checkEmbeddedSupport(methods.map(({ id }) => id));
    }, [props.methods]);

    const { selectedMethod = props.defaultMethod } = state;
    const uniqueSelectedMethodId =
        selectedMethod && getUniquePaymentMethodId(selectedMethod.id, selectedMethod.gateway);

    return (
      <ErrorModal
        error={error}
        message={mapSubmitOrderErrorMessage(
          error,
          language.translate.bind(language),
          shouldLocaliseErrorMessages,
        )}
        onClose={handleCloseModal}
        title={mapSubmitOrderErrorTitle(error, language.translate.bind(language))}
      />
    );
  };

  const renderEmbeddedSupportErrorModal = (): ReactNode => {
    const { checkEmbeddedSupport = noop, methods } = props;

    const checkout = getCheckout();
    const config = getConfig();
    const customer = getCustomer();
    const consignments = getConsignments();
    const paymentProviderCustomer = getPaymentProviderCustomer();

    const { isComplete = false } = getOrder() || {};
    const methods = getPaymentMethods() || EMPTY_ARRAY;

    return null;
  };

  const disableSubmit = (method: PaymentMethod, disabled = true): void => {
    const uniqueId = getUniquePaymentMethodId(method.id, method.gateway);
    const { shouldDisableSubmit } = state;

    if (shouldDisableSubmit[uniqueId] === disabled) {
      return;
    }

    setState((prevState) => ({
      ...prevState,
      shouldDisableSubmit: {
        ...shouldDisableSubmit,
        [uniqueId]: disabled,
      },
    }));
  };

    const isTermsConditionsRequired = isTermsConditionsEnabled;
    const { isStoreCreditApplied } = checkout;
    const { defaultMethod, filteredMethods } = getDefaultPaymentMethod({
        checkout,
        consignments,
        getPaymentMethod,
        methods,
        paymentProviderCustomer,
    });

    return {
        applyStoreCredit: checkoutService.applyStoreCredit,
        availableStoreCredit: customer.storeCredit,
        cartUrl: config.links.cartLink,
        clearError: checkoutService.clearError,
        defaultMethod,
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

    void init();

    return () => {
      const deInit = () => {
        if (grandTotalChangeUnsubscribe.current) {
          grandTotalChangeUnsubscribe.current();
          grandTotalChangeUnsubscribe.current = undefined;
        }

        window.removeEventListener('beforeunload', handleBeforeUnload);
      };

      deInit();
    };
  }, []);

  useEffect(() => {
    const { checkEmbeddedSupport = noop, methods } = props;

    checkEmbeddedSupport(methods.map(({ id }) => id));
  }, [props.methods]);

  const { selectedMethod = props.defaultMethod } = state;
  const uniqueSelectedMethodId =
    selectedMethod && getUniquePaymentMethodId(selectedMethod.id, selectedMethod.gateway);

  return (
    <PaymentContext.Provider value={getContextValue()}>
      <ChecklistSkeleton isLoading={!state.isReady}>
        {!isEmpty(props.methods) && props.defaultMethod && (
          <PaymentForm
            availableStoreCredit={props.availableStoreCredit}
            defaultGatewayId={props.defaultMethod.gateway}
            defaultMethodId={props.defaultMethod.id}
            didExceedSpamLimit={state.didExceedSpamLimit}
            isEmbedded={props.isEmbedded}
            isInitializingPayment={props.isInitializingPayment}
            isPaymentDataRequired={props.isPaymentDataRequired}
            isStoreCreditApplied={props.isStoreCreditApplied}
            isTermsConditionsRequired={props.isTermsConditionsRequired}
            isUsingMultiShipping={props.isUsingMultiShipping}
            methods={props.methods}
            onMethodSelect={setSelectedMethod}
            onStoreCreditChange={handleStoreCreditChange}
            onSubmit={handleSubmit}
            onUnhandledError={handleError}
            selectedMethod={state.selectedMethod}
            shouldDisableSubmit={
              (uniqueSelectedMethodId && state.shouldDisableSubmit[uniqueSelectedMethodId]) ||
              undefined
            }
            shouldExecuteSpamCheck={props.shouldExecuteSpamCheck}
            shouldHidePaymentSubmitButton={
              (uniqueSelectedMethodId &&
                props.isPaymentDataRequired() &&
                state.shouldHidePaymentSubmitButton[uniqueSelectedMethodId]) ||
              undefined
            }
            termsConditionsText={props.termsConditionsText}
            termsConditionsUrl={props.termsConditionsUrl}
            usableStoreCredit={props.usableStoreCredit}
            validationSchema={
              (uniqueSelectedMethodId && validationSchemasRef.current[uniqueSelectedMethodId]) ||
              undefined
            }
          />
        )}
      </ChecklistSkeleton>

      {renderOrderErrorModal()}
      {renderEmbeddedSupportErrorModal()}
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

  // TODO: In accordance with the checkout team, this functionality is temporary and will be implemented in the backend instead.
  if (paymentProviderCustomer?.stripeLinkAuthenticationState) {
    const stripeUpePaymentMethod = methods.filter(
      (method) => method.id === 'card' && method.gateway === PaymentMethodId.StripeUPE,
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
    const multiShippingIncompatibleMethodIds: string[] = [PaymentMethodId.AmazonPay];

    filteredMethods = methods.filter(
      (method: PaymentMethod) => !multiShippingIncompatibleMethodIds.includes(method.id),
    );
  }

  if (selectedPayment) {
    selectedPaymentMethod = getPaymentMethod(selectedPayment.providerId, selectedPayment.gatewayId);
    filteredMethods = selectedPaymentMethod ? compact([selectedPaymentMethod]) : filteredMethods;
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
    shouldLocaliseErrorMessages: features['PAYMENTS-6799.localise_checkout_payment_error_messages'],
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
