import React, { type FunctionComponent } from 'react';

import {
    type PaymentMethodProps,
    type PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

import { HostedPaymentComponent } from './components';

const HostedPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    checkoutService,
    checkoutState,
    method,
    onUnhandledError,
    language,
    paymentForm,
}) => {
    return (
        <HostedPaymentComponent
            checkoutService={checkoutService}
            checkoutState={checkoutState}
            deinitializePayment={checkoutService.deinitializePayment}
            initializePayment={checkoutService.initializePayment}
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
