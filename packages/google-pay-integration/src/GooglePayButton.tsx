import { CheckoutButton } from '@bigcommerce/checkout/checkout-button-integration';

import { CheckoutButtonProps, CheckoutButtonResolveId, EmbeddedCheckoutUnsupportedError, isEmbedded, toResolvableComponent } from '@bigcommerce/checkout/payment-integration-api';

import React, { FunctionComponent } from 'react';

const GooglePayButton: FunctionComponent<CheckoutButtonProps> = props => {
    const { language, onUnhandledError } = props;

    if (isEmbedded()) {
        onUnhandledError(new EmbeddedCheckoutUnsupportedError(
            language.translate('embedded_checkout.unsupported_error', {
                methods: 'googlepay',
            })
        ));

        return null;
    }

    return (
        <CheckoutButton { ...props } />
    );
}

export default toResolvableComponent<CheckoutButtonProps, CheckoutButtonResolveId>(
    GooglePayButton,
    [{ id: 'googlepay' }]
);
