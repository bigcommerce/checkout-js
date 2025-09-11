import React, { type FunctionComponent } from 'react';

import { HostedCreditCardComponent } from '@bigcommerce/checkout/hosted-credit-card-integration';
import { HostedPaymentComponent } from '@bigcommerce/checkout/hosted-payment-integration';
import {
    type PaymentMethodProps,
    type PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';

const PayPalPaymentsProPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    method,
    checkoutService,
    checkoutState,
    paymentForm,
    language,
    onUnhandledError,
}) => {
    if (method.type === 'PAYMENT_TYPE_HOSTED') {
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
    }

    return (
        <HostedCreditCardComponent
            checkoutService={checkoutService}
            checkoutState={checkoutState}
            language={language}
            method={method}
            onUnhandledError={onUnhandledError}
            paymentForm={paymentForm}
        />
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    PayPalPaymentsProPaymentMethod,
    [{ id: 'paypal' }],
);
