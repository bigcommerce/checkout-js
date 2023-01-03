import { CustomerInitializeOptions } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, useCallback, useContext } from 'react';

import { navigateToOrderConfirmation } from '../../checkout';
import { LocaleContext } from '../../locale';
import CheckoutButton, { CheckoutButtonProps } from '../CheckoutButton';

const PayPalCommerceButton: FunctionComponent<CheckoutButtonProps> = ({
    initialize,
    onError,
    ...rest
}) => {
    const localeContext = useContext(LocaleContext);
    const initializeOptions = useCallback(
        (options: CustomerInitializeOptions) =>
            initialize({
                ...options,
                paypalcommerce: {
                    container: rest.containerId,
                    onError,
                    onComplete: navigateToOrderConfirmation,
                },
            }),
        [initialize, localeContext, onError, rest.containerId],
    );

    return <CheckoutButton initialize={initializeOptions} {...rest} />;
};

export default PayPalCommerceButton;
