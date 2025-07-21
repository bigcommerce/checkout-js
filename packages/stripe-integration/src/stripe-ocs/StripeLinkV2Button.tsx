import React, { FunctionComponent } from 'react';

import { CheckoutButton } from '@bigcommerce/checkout/checkout-button-integration';
import {
    CheckoutButtonProps,
    CheckoutButtonResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';
import { navigateToOrderConfirmation } from '@bigcommerce/checkout/utility';

const StripeLinkV2Button: FunctionComponent<CheckoutButtonProps> = (props) => {
    const additionalInitializationOptions = {
        onComplete: navigateToOrderConfirmation,
        loadingContainerId: 'checkout-app',
        methodId: 'optimized_checkout',
        gatewayId: 'stripeocs',
    };

    return (
        <CheckoutButton
            additionalInitializationOptions={additionalInitializationOptions}
            {...props}
        />
    );
};

export default toResolvableComponent<CheckoutButtonProps, CheckoutButtonResolveId>(
    StripeLinkV2Button,
    [{ id: 'stripeocs' }],
);
