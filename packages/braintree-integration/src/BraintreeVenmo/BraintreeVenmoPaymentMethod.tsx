import React from 'react';

import { toResolvableComponent } from '@bigcommerce/checkout/payment-integration-api';
import type {
    PaymentMethodProps,
    PaymentMethodResolveId,
} from '@bigcommerce/checkout/payment-integration-api';
import { HostedPaymentComponent } from '@bigcommerce/checkout/hosted-payment-integration';

const BraintreeVenmoPaymentMethod: React.FC<PaymentMethodProps> = ({
    checkoutService,
    checkoutState,
    language,
    method,
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
            paymentForm={paymentForm}
        />
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    BraintreeVenmoPaymentMethod,
    [{ id: 'braintreevenmo' }],
);
