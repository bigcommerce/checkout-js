import { CustomerInitializeOptions } from '@bigcommerce/checkout-sdk';
import React, { useCallback, useContext, FunctionComponent } from 'react';

import { navigateToOrderConfirmation } from '../../checkout';
import { LocaleContext } from '../../locale';
import CheckoutButton, { CheckoutButtonProps } from '../CheckoutButton';

const ApplePayButton: FunctionComponent<CheckoutButtonProps> = ({
    initialize,
    onError,
    ...rest
}) => {
    const localeContext = useContext(LocaleContext);
    const initializeOptions = useCallback((options: CustomerInitializeOptions) => initialize({
        ...options,
        applepay: {
            shippingLabel: localeContext?.language.translate('cart.shipping_text'),
            subtotalLabel: localeContext?.language.translate('cart.subtotal_text'),
            onError,
            onPaymentAuthorize: navigateToOrderConfirmation,
        },
    }), [initialize, localeContext, onError]);

    return <CheckoutButton initialize={ initializeOptions } { ...rest } />;
};

export default ApplePayButton;
