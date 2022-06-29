import React, { FunctionComponent } from 'react';

import { toResolvableComponent, PaymentMethodProps } from '../../core/paymentIntegration';

const AnotherSamplePaymentMethod: FunctionComponent<PaymentMethodProps> = () => <></>;

export default toResolvableComponent(
    AnotherSamplePaymentMethod,
    [{ type: 'anotherSample' }]
);
