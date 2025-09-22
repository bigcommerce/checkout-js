import { createStripeLinkV2CustomerStrategy } from '@bigcommerce/checkout-sdk/integrations/stripe';
import React, { type FunctionComponent } from 'react';

import { CheckoutButton } from '@bigcommerce/checkout/checkout-button-integration';
import {
    type CheckoutButtonProps,
    type CheckoutButtonResolveId,
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
            integrations={[createStripeLinkV2CustomerStrategy]}
            {...props}
        />
    );
};

export default toResolvableComponent<CheckoutButtonProps, CheckoutButtonResolveId>(
    StripeLinkV2Button,
    [{ id: 'stripeocs' }],
);
