import { type PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import {
    createGooglePayAdyenV2PaymentStrategy,
    createGooglePayAdyenV3PaymentStrategy,
    createGooglePayAuthorizeNetPaymentStrategy,
    createGooglePayBigCommercePaymentsPaymentStrategy,
    createGooglePayBraintreePaymentStrategy,
    createGooglePayCheckoutComPaymentStrategy,
    createGooglePayCybersourcePaymentStrategy,
    createGooglePayOrbitalPaymentStrategy,
    createGooglePayPPCPPaymentStrategy,
    createGooglePayStripePaymentStrategy,
    createGooglePayTdOnlineMartPaymentStrategy,
    createGooglePayWorldpayAccessPaymentStrategy,
} from '@bigcommerce/checkout-sdk/integrations/google-pay';
import { type FunctionComponent, useEffect } from 'react';

import { type PaymentMethodProps } from '@bigcommerce/checkout/payment-integration-api';

const GOOGLE_PAY_BUTTON_CONTAINER_ID = 'checkout-payment-continue';

const GooglePayPaymentMethodComponent: FunctionComponent<PaymentMethodProps> = ({
    checkoutService,
    method,
    paymentForm,
    onUnhandledError,
}) => {
    useEffect(() => {
        // Hiding the Place Order button causes Payment.tsx to render the
        // #checkout-payment-continue container div.  That state update is
        // committed to the DOM before any setTimeout(0) macrotask fires, so
        // by the time initializePayment runs the container is already present
        // and the SDK can append the branded Google Pay button into it directly.
        paymentForm.hidePaymentSubmitButton(method, true);

        const timeoutId = setTimeout(async () => {
            try {
                const mergedOptions: PaymentInitializeOptions = {
                    gatewayId: method.gateway,
                    methodId: method.id,
                    integrations: [
                        createGooglePayAdyenV2PaymentStrategy,
                        createGooglePayAdyenV3PaymentStrategy,
                        createGooglePayAuthorizeNetPaymentStrategy,
                        createGooglePayCheckoutComPaymentStrategy,
                        createGooglePayCybersourcePaymentStrategy,
                        createGooglePayOrbitalPaymentStrategy,
                        createGooglePayStripePaymentStrategy,
                        createGooglePayWorldpayAccessPaymentStrategy,
                        createGooglePayBraintreePaymentStrategy,
                        createGooglePayPPCPPaymentStrategy,
                        createGooglePayBigCommercePaymentsPaymentStrategy,
                        createGooglePayTdOnlineMartPaymentStrategy,
                    ],
                    [method.id]: {
                        container: GOOGLE_PAY_BUTTON_CONTAINER_ID,
                        buttonColor: 'default',
                        buttonSizeMode: 'fill',
                        buttonType: 'pay',
                        loadingContainerId: 'checkout-app',
                        onError: onUnhandledError,
                    },
                };

                await checkoutService.initializePayment(mergedOptions);
            } catch (error) {
                if (error instanceof Error) {
                    onUnhandledError(error);
                }
            }
        }, 0);

        return () => {
            clearTimeout(timeoutId);
            paymentForm.hidePaymentSubmitButton(method, false);

            void checkoutService.deinitializePayment({
                gatewayId: method.gateway,
                methodId: method.id,
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
};

export default GooglePayPaymentMethodComponent;
