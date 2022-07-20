import { HostedPaymentMethodProps } from '@bigcommerce/checkout-js/payment-integration';
import React, { FunctionComponent } from 'react';

import BoltClientPaymentMethod from './BoltClientPaymentMethod';
import BoltEmbeddedPaymentMethod from './BoltEmbeddedPaymentMethod';

const BoltPaymentMethod: FunctionComponent<HostedPaymentMethodProps> = props => {
    const useBoltEmbedded = props?.method?.initializationData?.embeddedOneClickEnabled;

    if (useBoltEmbedded) {
        return <BoltEmbeddedPaymentMethod { ...props } />;
    }

    return <BoltClientPaymentMethod { ...props } />;
};

export default BoltPaymentMethod;
