import React, { type FunctionComponent } from 'react';

import {
    type PaymentMethodProps,
    type PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';
import { createZipPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/zip';
import { type PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';

import { HostedPaymentComponent } from './components';

const HostedPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    checkoutService,
    checkoutState,
    method,
    onUnhandledError,
    language,
    paymentForm,
}) => {
    const initializeHostedPaymentMethod = async (options: PaymentInitializeOptions) => {
        return checkoutService.initializePayment({
            ...options,
            integrations: [createZipPaymentStrategy],
        });
    };

    return (
        <HostedPaymentComponent
            checkoutService={checkoutService}
            checkoutState={checkoutState}
            deinitializePayment={checkoutService.deinitializePayment}
            initializePayment={initializeHostedPaymentMethod}
            language={language}
            method={method}
            onUnhandledError={onUnhandledError}
            paymentForm={paymentForm}
        />
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    HostedPaymentMethod,
    [{ gateway: 'afterpay' }, { id: 'quadpay' }, { id: 'sezzle' }, { id: 'zip' }],
);
