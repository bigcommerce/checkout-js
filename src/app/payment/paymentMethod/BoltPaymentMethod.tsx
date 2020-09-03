import React, { useCallback, FunctionComponent } from 'react';

import HostedPaymentMethod, { HostedPaymentMethodProps } from './HostedPaymentMethod';

const BoltPaymentMethod: FunctionComponent<HostedPaymentMethodProps> = ({
    initializePayment,
    ...rest
}) => {
    const initializeBoltPayment = useCallback(options => initializePayment({
        ...options,
        bolt: {
            useBigCommerceCheckout: true,
        },
    }), [initializePayment]);

    return <HostedPaymentMethod
        { ...rest }
        initializePayment={ initializeBoltPayment }
    />;
};

export default BoltPaymentMethod;
