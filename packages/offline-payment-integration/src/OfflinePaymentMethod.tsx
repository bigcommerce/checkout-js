import { createOfflinePaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/offline';
import React, { type FunctionComponent, useEffect } from 'react';

import {
    getPaymentFormFields,
    type PaymentMethodProps,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

import PaymentFormFields from './PaymentFormFields';

const OfflinePaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    method,
    checkoutService,
    onUnhandledError,
}) => {
    useEffect(() => {
        const initializePayment = async () => {
            try {
                await checkoutService.initializePayment({
                    gatewayId: method.gateway,
                    methodId: method.id,
                    integrations: [createOfflinePaymentStrategy],
                });
            } catch (error) {
                if (error instanceof Error) {
                    onUnhandledError(error);
                }
            }
        };

        void initializePayment();

        return () => {
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

            void deinitializePayment();
        };
    }, [checkoutService, method.gateway, method.id, onUnhandledError]);

    const formFields = getPaymentFormFields(method.initializationData?.formFieldsData);

    if (!formFields.length) {
        return null;
    }

    return <PaymentFormFields fields={formFields} />;
};

export default toResolvableComponent(OfflinePaymentMethod, [
    {
        type: 'PAYMENT_TYPE_OFFLINE',
    },
]);
