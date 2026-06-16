import { type PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import { type FunctionComponent, useEffect, useRef } from 'react';

import { useCheckout } from '@bigcommerce/checkout/contexts';
import {
    type PaymentFormService,
    type PaymentMethodProps,
} from '@bigcommerce/checkout/payment-integration-api';

import googlePayIntegrations from './googlePayIntegrations';

const GOOGLE_PAY_BUTTON_CONTAINER_ID = 'checkout-payment-continue';

const GooglePayPaymentMethodComponent: FunctionComponent<PaymentMethodProps> = ({
    checkoutService,
    method,
    paymentForm,
    onUnhandledError,
}) => {
    const {
        checkoutState: {
            data: { getConfig },
        },
    } = useCheckout();

    const isTermsConditionsRequired = Boolean(
        getConfig()?.checkoutSettings.enableTermsAndConditions,
    );

    const paymentFormRef = useRef<PaymentFormService>(paymentForm);

    paymentFormRef.current = paymentForm;

    useEffect(() => {
        let isMounted = true;

        paymentFormRef.current.hidePaymentSubmitButton(method, true);

        const guardTermsConditions = (event: MouseEvent) => {
            const container = document.getElementById(GOOGLE_PAY_BUTTON_CONTAINER_ID);
            const target = event.target;

            if (!container || !(target instanceof Node) || !container.contains(target)) {
                return;
            }

            const { terms } = paymentFormRef.current.getFormValues();

            if (isTermsConditionsRequired && !terms) {
                event.stopPropagation();
                event.preventDefault();

                void paymentFormRef.current.validateForm().then((errors) => {
                    if (!isMounted) {
                        return;
                    }

                    paymentFormRef.current.setSubmitted(true);

                    if (errors.terms) {
                        paymentFormRef.current.setFieldTouched('terms', true);
                    }
                });
            }
        };

        document.addEventListener('click', guardTermsConditions, true);

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
            isMounted = false;
            clearTimeout(timeoutId);
            document.removeEventListener('click', guardTermsConditions, true);
            paymentFormRef.current.hidePaymentSubmitButton(method, false);

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
