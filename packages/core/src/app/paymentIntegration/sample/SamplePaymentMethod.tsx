import { toResolvableComponent, PaymentMethodProps } from '@bigcommerce/checkout-js/payment-integration';
import React, { FunctionComponent } from 'react';

const SamplePaymentMethod: FunctionComponent<PaymentMethodProps> = () => <></>;

export default toResolvableComponent(
    SamplePaymentMethod,
    [{ id: 'sample' }]
);
