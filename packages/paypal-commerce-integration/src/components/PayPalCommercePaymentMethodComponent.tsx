import React, { FunctionComponent, useEffect } from 'react';

import {
    PayPalCommerceAlternativeMethodsPaymentOptions,
    PayPalCommercePaymentInitializeOptions,
    PayPalCommerceCreditPaymentInitializeOptions,
    PayPalCommerceVenmoPaymentInitializeOptions,
} from '@bigcommerce/checkout-sdk';
import { PaymentMethodProps } from '@bigcommerce/checkout/payment-integration-api';

type PayPalCommerceProvidersPaymentInitializeOptions = PayPalCommerceAlternativeMethodsPaymentOptions
    & PayPalCommerceCreditPaymentInitializeOptions
    & PayPalCommercePaymentInitializeOptions
    & PayPalCommerceVenmoPaymentInitializeOptions;

interface PayPalCommercePaymentMethodComponentProps {
    providerOptionsKey: string;
    providerOptionsData?: Partial<PayPalCommerceProvidersPaymentInitializeOptions>;
}

const PayPalCommercePaymentMethodComponent: FunctionComponent<PaymentMethodProps & PayPalCommercePaymentMethodComponentProps> = ({
    method,
    checkoutService,
    paymentForm,
    onUnhandledError,
    providerOptionsKey,
    providerOptionsData,
    children,
}) => {
    const initializePayment = async () => {
        try {
            await checkoutService.initializePayment({
                gatewayId: method.gateway,
                methodId: method.id,
                [providerOptionsKey]: {
                    container: '#checkout-payment-continue',
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
                    onValidate: async (resolve: () => void, reject: () => void): Promise<void> => {
                        const validationErrors = await paymentForm.validateForm();
                        const keysValidation = Object.keys(validationErrors);

                        if (keysValidation.length) {
                            paymentForm.setSubmitted(true);
                            keysValidation.forEach((key) => paymentForm.setFieldTouched(key));

                            return reject();
                        }

                        return resolve();
                    },
                    ...(providerOptionsData || {}),
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

    return children ? <>{children}</> : <></>;
}

export default PayPalCommercePaymentMethodComponent;
