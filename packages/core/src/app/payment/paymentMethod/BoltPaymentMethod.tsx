import React, { FunctionComponent } from 'react';

import BoltClientPaymentMethod from './BoltClientPaymentMethod';
import BoltEmbeddedPaymentMethod from './BoltEmbeddedPaymentMethod';
import { HostedPaymentMethodProps } from './HostedPaymentMethod';

const BoltPaymentMethod: FunctionComponent<HostedPaymentMethodProps> = (props) => {
    const useBoltEmbedded = props.method.initializationData?.embeddedOneClickEnabled;

    if (useBoltEmbedded) {
        return <BoltEmbeddedPaymentMethod {...props} />;
    }

    return <BoltClientPaymentMethod {...props} />;
};

export default BoltPaymentMethod;
