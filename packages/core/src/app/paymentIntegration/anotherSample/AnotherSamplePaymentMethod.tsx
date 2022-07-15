import { toResolvableComponent, PaymentMethodProps } from '@bigcommerce/checkout-js/payment-integration';
import React, { FunctionComponent } from 'react';

const AnotherSamplePaymentMethod: FunctionComponent<PaymentMethodProps> = () => <></>;

export default toResolvableComponent(
    AnotherSamplePaymentMethod,
    [{ type: 'anotherSample' }]
);
