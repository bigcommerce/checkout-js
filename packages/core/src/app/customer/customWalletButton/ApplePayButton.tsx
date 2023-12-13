import { CustomerInitializeOptions } from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { FunctionComponent, useCallback, useContext } from 'react';

import { LocaleContext } from '@bigcommerce/checkout/locale';

import { navigateToOrderConfirmation } from '../../checkout';
import CheckoutButton, { CheckoutButtonProps } from '../CheckoutButton';

const ApplePayButton: FunctionComponent<CheckoutButtonProps> = ({
    initialize,
    onError,
    onClick = noop,
    ...rest
}) => {
    const localeContext = useContext(LocaleContext);
    const initializeOptions = useCallback(
        (options: CustomerInitializeOptions) =>
            initialize({
                ...options,
                applepay: {
                    container: rest.containerId,
                    shippingLabel: localeContext?.language.translate('cart.shipping_text'),
                    subtotalLabel: localeContext?.language.translate('cart.subtotal_text'),
                    onError,
                    onClick: () => onClick(rest.methodId),
                    onPaymentAuthorize: navigateToOrderConfirmation,
                },
            }),
        [initialize, localeContext, onError, rest.containerId],
    );

    return <CheckoutButton initialize={initializeOptions} {...rest} />;
};

export default ApplePayButton;
