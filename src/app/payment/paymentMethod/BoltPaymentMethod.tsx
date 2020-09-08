import React, { useCallback, useContext, FunctionComponent } from 'react';

import PaymentContext from '../PaymentContext';

import HostedPaymentMethod, { HostedPaymentMethodProps } from './HostedPaymentMethod';
import OfflinePaymentMethod from './OfflinePaymentMethod';

const BoltPaymentMethod: FunctionComponent<HostedPaymentMethodProps> = ({
    initializePayment,
    method,
    ...rest
}) => {
    const paymentContext = useContext(PaymentContext);
    const disableInCheckout = !(method.initializationData && method.initializationData.showInCheckout);

    const initializeBoltPayment = useCallback(options => initializePayment({
        ...options,
        bolt: {
            useBigCommerceCheckout: true,
        },
    }), [initializePayment]);

    const disableMethod = (() => {
        if (paymentContext) {
            paymentContext.disableSubmit(method, true);
        }
    });

    if (disableInCheckout) {
        const methodPlaceholder = {
            ...method,
            id: '',
        };

        return <OfflinePaymentMethod
            { ...rest }
            initializePayment={ initializePayment }
            method = { methodPlaceholder }
            onUnhandledError= { disableMethod }
        />;
    }

    return <HostedPaymentMethod
        { ...rest }
        initializePayment={ initializeBoltPayment }
        method={ method }
    />;
};

export default BoltPaymentMethod;
