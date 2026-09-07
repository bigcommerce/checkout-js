import { type ShippingOption } from '@bigcommerce/checkout-sdk';
import { createApplePayCustomerStrategy } from '@bigcommerce/checkout-sdk/integrations/apple-pay';
import React, { type FunctionComponent } from 'react';

import { CheckoutButton } from '@bigcommerce/checkout/checkout-button-integration';
import {
    type CheckoutButtonProps,
    type CheckoutButtonResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';
import { navigateToOrderConfirmation } from '@bigcommerce/checkout/utility';

const ApplePayButton: FunctionComponent<CheckoutButtonProps> = (props) => {
    const { language, onUnhandledError } = props;

    const integrations = [createApplePayCustomerStrategy];

    const filterAvailableShippingOptions = (shippingOptions: ShippingOption[]) =>
        Promise.resolve(
            shippingOptions.filter((option) => option.type !== 'shipping_pickupinstore'),
        );

    const additionalInitializationOptions = {
        shippingLabel: language.translate('cart.shipping_text'),
        subtotalLabel: language.translate('cart.subtotal_text'),
        onPaymentAuthorize: navigateToOrderConfirmation,
        onError: onUnhandledError,
        filterAvailableShippingOptions,
    };

    return (
        <CheckoutButton
            additionalInitializationOptions={additionalInitializationOptions}
            integrations={integrations}
            {...props}
        />
    );
};

export default toResolvableComponent<CheckoutButtonProps, CheckoutButtonResolveId>(ApplePayButton, [
    { id: 'applepay' },
]);
