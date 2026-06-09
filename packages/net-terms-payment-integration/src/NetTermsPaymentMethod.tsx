import { createNetTermsPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/net-terms';
import React, { type FunctionComponent, useEffect } from 'react';

import {
    PaymentMethodId,
    type PaymentMethodProps,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

import PoNumber from './PoNumber';

const NetTermsPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    method,
    checkoutService,
    onUnhandledError,
    paymentForm,
    language,
}) => {
    useEffect(() => {
        const initializePayment = async () => {
            try {
                await checkoutService.initializePayment({
                    gatewayId: method.gateway,
                    methodId: method.id,
                    integrations: [createNetTermsPaymentStrategy],
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

    return (
        <PoNumber
            isRequired={true}
            label={language.translate('payment.net_terms.po_number_label')}
            language={language}
            method={method}
            paymentForm={paymentForm}
        />
    );
};

export default toResolvableComponent(NetTermsPaymentMethod, [
    {
        id: PaymentMethodId.NetTerms,
        type: 'PAYMENT_TYPE_OFFLINE',
    },
]);
