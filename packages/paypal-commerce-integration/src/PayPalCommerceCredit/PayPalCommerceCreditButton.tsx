import { createPayPalCommerceCreditCustomerStrategy } from '@bigcommerce/checkout-sdk/integrations';
import React, { FunctionComponent } from 'react';

import { CheckoutButton } from '@bigcommerce/checkout/checkout-button-integration';
import {
    CheckoutButtonProps,
    CheckoutButtonResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';
import { navigateToOrderConfirmation } from '@bigcommerce/checkout/utility';

const PayPalCommerceCreditButton: FunctionComponent<CheckoutButtonProps> = (props) => {
    const { onUnhandledError } = props;
    const additionalInitializationOptions = {
        onComplete: navigateToOrderConfirmation,
        onError: onUnhandledError,
    };

    return (
        <CheckoutButton
            additionalInitializationOptions={additionalInitializationOptions}
            {...props}
            integrations={[createPayPalCommerceCreditCustomerStrategy]}
        />
    );
};

export default toResolvableComponent<CheckoutButtonProps, CheckoutButtonResolveId>(
    PayPalCommerceCreditButton,
    [{ id: 'paypalcommercecredit' }],
);
