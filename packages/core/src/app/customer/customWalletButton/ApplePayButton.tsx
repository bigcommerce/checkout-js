import { type CustomerInitializeOptions } from '@bigcommerce/checkout-sdk';
import { createApplePayCustomerStrategy } from '@bigcommerce/checkout-sdk/integrations/apple-pay';
import { noop } from 'lodash';
import React, { type FunctionComponent, useCallback, useContext } from 'react';

import { LocaleContext } from '@bigcommerce/checkout/locale';
import { navigateToOrderConfirmation } from '@bigcommerce/checkout/utility';

import CheckoutButton, { type CheckoutButtonProps } from '../CheckoutButton';

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
                integrations: [createApplePayCustomerStrategy],
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
