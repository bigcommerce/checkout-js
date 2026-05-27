import { type PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import { type FunctionComponent, useEffect } from 'react';

import { type PaymentMethodProps } from '@bigcommerce/checkout/payment-integration-api';

import googlePayIntegrations from './googlePayIntegrations';

const GOOGLE_PAY_BUTTON_CONTAINER_ID = 'checkout-payment-continue';

const GooglePayPaymentMethodComponent: FunctionComponent<PaymentMethodProps> = ({
    checkoutService,
    method,
    paymentForm,
    onUnhandledError,
}) => {
    useEffect(() => {
        paymentForm.hidePaymentSubmitButton(method, true);

        const timeoutId = setTimeout(async () => {
            try {
                const mergedOptions: PaymentInitializeOptions = {
                    gatewayId: method.gateway,
                    methodId: method.id,
                    integrations: googlePayIntegrations,
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
