import React, { useCallback, FunctionComponent } from 'react';
// import { Omit } from 'utility-types';

import CreditCardPaymentMethod, { CreditCardPaymentMethodProps } from './CreditCardPaymentMethod';
// import { HostedWidgetPaymentMethodProps } from './HostedWidgetPaymentMethod';

// export type ElavonPaymentMethodProps = Omit<HostedWidgetPaymentMethodProps, 'containerId'>;

const ElavonPaymentMethod: FunctionComponent<CreditCardPaymentMethodProps> = ({
    initializePayment,
    ...rest
}) => {
    const initializeElavonPaymentMethod = useCallback(options => initializePayment(
        {
            ...options,
        }
    ), [initializePayment]);

    return <CreditCardPaymentMethod
        { ...rest }
        initializePayment={ initializeElavonPaymentMethod }
    />;
};

export default ElavonPaymentMethod;
