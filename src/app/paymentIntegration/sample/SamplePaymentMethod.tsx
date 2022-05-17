import React, { FunctionComponent } from 'react';

import { toResolvableComponent, PaymentMethodProps } from '../../core/paymentIntegration';

const SamplePaymentMethod: FunctionComponent<PaymentMethodProps> = () => <></>;

export default toResolvableComponent(
    SamplePaymentMethod,
    [{ id: 'sample' }]
);
