import { createOfflinePaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/offline';
import React, { type FunctionComponent, useEffect } from 'react';

import { useCapabilities } from '@bigcommerce/checkout/contexts';
import {
    type PaymentMethodProps,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

import PoNumber from './PoNumber';

const ChequePaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    method,
    checkoutService,
    checkoutState,
    onUnhandledError,
    paymentForm,
    language,
}) => {
    const {
        payment: { poConfig },
    } = useCapabilities();
    const isFloatingLabelEnabled = Boolean(
        checkoutState.data.getConfig()?.checkoutSettings.checkoutUserExperienceSettings
            .floatingLabelEnabled,
    );

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

    if (poConfig?.field) {
        return (
            <PoNumber
                isFloatingLabelEnabled={isFloatingLabelEnabled}
                isRequired={poConfig.field.required}
                label={poConfig.field.label}
                language={language}
                method={method}
                paymentForm={paymentForm}
            />
        );
    }

    return null;
};

export default toResolvableComponent(ChequePaymentMethod, [
    {
        id: 'cheque',
        type: 'PAYMENT_TYPE_OFFLINE',
    },
]);
