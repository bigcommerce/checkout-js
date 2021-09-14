import React, { useCallback, useState, FunctionComponent } from 'react';

import BoltCustomForm from './BoltCustomForm';
import { HostedPaymentMethodProps } from './HostedPaymentMethod';
import HostedWidgetPaymentMethod from './HostedWidgetPaymentMethod';

const BoltEmbeddedPaymentMethod: FunctionComponent<HostedPaymentMethodProps> = ({
    initializePayment,
    method,
    ...rest
}) => {
    const [ showCreateAccountCheckbox, setShowCreateAccountCheckbox ] = useState(false);

    const boltEmbeddedContainerId = 'bolt-embedded';

    const initializeBoltPayment = useCallback(options => initializePayment({
            ...options,
            bolt: {
                containerId: boltEmbeddedContainerId,
                useBigCommerceCheckout: true,
                onPaymentSelect: (hasBoltAccount: boolean) => {
                    setShowCreateAccountCheckbox(!hasBoltAccount);
                },
            },
        }
    ), [initializePayment, boltEmbeddedContainerId]);

    const renderCustomPaymentForm = useCallback(() => (
        <BoltCustomForm
            containerId={ boltEmbeddedContainerId }
            showCreateAccountCheckbox={ showCreateAccountCheckbox }
        />
    ), [ boltEmbeddedContainerId, showCreateAccountCheckbox ]);

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
