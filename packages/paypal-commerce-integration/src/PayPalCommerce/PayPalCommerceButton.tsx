import { createPayPalCommerceCustomerStrategy } from '@bigcommerce/checkout-sdk/integrations/paypal-commerce';
import React, { type FunctionComponent } from 'react';

import { CheckoutButton } from '@bigcommerce/checkout/checkout-button-integration';
import {
    type CheckoutButtonProps,
    type CheckoutButtonResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';
import { navigateToOrderConfirmation } from '@bigcommerce/checkout/utility';

const PayPalCommerceButton: FunctionComponent<CheckoutButtonProps> = (props) => {
    const { onUnhandledError } = props;
    const additionalInitializationOptions = {
        onComplete: navigateToOrderConfirmation,
        onError: onUnhandledError,
    };

    return (
        <CheckoutButton
            additionalInitializationOptions={additionalInitializationOptions}
            integrations={[createPayPalCommerceCustomerStrategy]}
            {...props}
        />
    );
};

export default toResolvableComponent<CheckoutButtonProps, CheckoutButtonResolveId>(
    PayPalCommerceButton,
    [{ id: 'paypalcommerce' }],
);
