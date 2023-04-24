import { CustomerInitializeOptions } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, useCallback, useContext } from 'react';

import { LocaleContext } from '@bigcommerce/checkout/locale';

import { navigateToOrderConfirmation } from '../../checkout';
import CheckoutButton, { CheckoutButtonProps } from '../CheckoutButton';

const PayPalCommerceButton: FunctionComponent<CheckoutButtonProps> = ({
    methodId,
    initialize,
    onError,
    ...rest
}) => {
    const localeContext = useContext(LocaleContext);
    const initializeOptions = useCallback(
        (options: CustomerInitializeOptions) =>
            initialize({
                ...options,
                [methodId]: {
                    container: rest.containerId,
                    onError,
                    onComplete: navigateToOrderConfirmation,
                },
            }),
        [initialize, localeContext, onError, rest.containerId],
    );

    return <CheckoutButton initialize={initializeOptions} methodId={methodId} {...rest} />;
};

export default PayPalCommerceButton;
