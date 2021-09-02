import React, { useCallback, FunctionComponent } from 'react';

import BoltCustomForm from './BoltCustomForm';
import { HostedPaymentMethodProps } from './HostedPaymentMethod';
import HostedWidgetPaymentMethod from './HostedWidgetPaymentMethod';

const BoltEmbeddedPaymentMethod: FunctionComponent<HostedPaymentMethodProps> = ({
    initializePayment,
    method,
    ...rest
}) => {
    const boltEmbeddedContainerId = 'bolt-embedded';

    const initializeBoltPayment = useCallback(options => initializePayment({
            ...options,
            bolt: {
                containerId: boltEmbeddedContainerId,
                useBigCommerceCheckout: true,
            },
        }
    ), [initializePayment, boltEmbeddedContainerId]);

    const renderCustomPaymentForm = useCallback(() => (
        <BoltCustomForm
            containerId={ boltEmbeddedContainerId }
        />
    ), [ boltEmbeddedContainerId ]);

    return <HostedWidgetPaymentMethod
        { ...rest }
        containerId="boltEmbeddedOneClick"
        initializePayment={ initializeBoltPayment }
        method={ method }
        renderCustomPaymentForm={ renderCustomPaymentForm }
        shouldRenderCustomInstrument
    />;
};

export default BoltEmbeddedPaymentMethod;
