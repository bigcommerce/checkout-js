import { createOfflinePaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/offline';
import React, { type FunctionComponent, useEffect } from 'react';

import { useCapabilities } from '@bigcommerce/checkout/contexts';
import {
    type PaymentMethodProps,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';
import { getPoNumber } from '@bigcommerce/checkout/utility';

import getPoNumberValidationSchema from './getPoNumberValidationSchema';
import PoNumber, { PO_NUMBER_FIELD_NAME } from './PoNumber';

const ChequePaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    method,
    checkoutService,
    onUnhandledError,
    paymentForm: { setFieldValue, setValidationSchema },
    language,
}) => {
    const {
        payment: { poConfig },
    } = useCapabilities();

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

    useEffect(() => {
        if (!poConfig) {
            return;
        }

        setFieldValue(PO_NUMBER_FIELD_NAME, getPoNumber());
        setValidationSchema(method, getPoNumberValidationSchema(language, poConfig.required));

        return () => {
            setValidationSchema(method, null);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [poConfig, language, method, setValidationSchema]);

    if (poConfig) {
        return <PoNumber isRequired={poConfig.required} label={poConfig.label} />;
    }

    return null;
};

export default toResolvableComponent(ChequePaymentMethod, [
    {
        id: 'cheque',
        type: 'PAYMENT_TYPE_OFFLINE',
    },
]);
