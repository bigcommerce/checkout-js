import React, { FunctionComponent, useEffect } from 'react';

import {
    getUniquePaymentMethodId,
    PaymentMethodProps,
    PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

const PaypalCommerceRatePayPaymentMethod: FunctionComponent<any> = ({
 method,
 checkoutService,
 paymentForm,
 onUnhandledError,
}) => {
    const widgetContainerId = getUniquePaymentMethodId(method.id, method.gateway);
    const initializePayment = async () => {
        try {
            await checkoutService.initializePayment({
                gatewayId: method.gateway,
                methodId: method.id,
                paypalcommerceratepay: {
                    container: '#checkout-payment-continue',
                    apmFieldsContainer: `#${widgetContainerId}`,
                    apmFieldsStyles: {
                        variables: {
                            fontFamily: 'Open Sans, Helvetica Neue, Arial, sans-serif',
                            colorBackground: 'transparent',
                            textColor: 'black',
                            fontSizeBase: '16px',
                            spacingUnit: '1rem',
                            borderColor: '#d9d9d9',
                            borderRadius: '4px',
                            borderWidth: '1px',
                        },
                        rules: {
                            '.Input': {
                                backgroundColor: 'white',
                                color: '#333',
                                fontSize: '1rem',
                            },
                            '.Input:active': {
                                color: '#4496f6',
                            },
                            '.Input--invalid': {
                                color: '#ed6a6a',
                            },
                        },
                    },
                    onRenderButton: () => {
                        paymentForm.hidePaymentSubmitButton(method, true);
                    },
                    submitForm: () => {
                        paymentForm.setSubmitted(true);
                        paymentForm.submitForm();
                    },
                    onError: (error: Error) => {
                        paymentForm.disableSubmit(method, true);
                        onUnhandledError(error);
                    },
                },
            });
        } catch (error) {
            if (error instanceof Error) {
                onUnhandledError(error);
            }
        }
    };

    const deinitializePayment = async () => {
        try {
            await checkoutService.deinitializePayment({
                gatewayId: method.gateway,
                methodId: method.id,
            });
        } catch (error) {
            if (error instanceof Error) {
                onUnhandledError(error);
            }
        }
    };

    useEffect(() => {
        void initializePayment();

        return () => {
            void deinitializePayment();
        };
    }, []);

    return <><div
        className={`widget widget--${method.id} payment-widget`}
        id={widgetContainerId}
    ></div></>;
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    PaypalCommerceRatePayPaymentMethod,
    [{ gateway: 'paypalcommercealternativemethods', id:'ratepay' }],
);
