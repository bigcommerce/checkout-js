import { createStripeLinkV2CustomerStrategy } from '@bigcommerce/checkout-sdk/integrations/stripe';
import React, { type FunctionComponent, useState } from 'react';

import { CheckoutButton } from '@bigcommerce/checkout/checkout-button-integration';
import {
    type CheckoutButtonProps,
    type CheckoutButtonResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';
import { navigateToOrderConfirmation } from '@bigcommerce/checkout/utility';

const StripeLinkV2Button: FunctionComponent<CheckoutButtonProps> = (props) => {
    const { onUnhandledError } = props;
    const [isReady, setIsReady] = useState(false);

    const additionalInitializationOptions = {
        onComplete: navigateToOrderConfirmation,
        onReady: () => setIsReady(true),
        loadingContainerId: 'checkout-app',
        methodId: 'optimized_checkout',
        gatewayId: 'stripeocs',
    };

    const handleUnhandledError = (error: Error) => {
        setIsReady(true);
        onUnhandledError(error);
    };

    return (
        <div className="stripe-link-v2-button">
            {!isReady && (
                <div className="walletbuttons-skeleton" data-test="stripe-link-v2-button-skeleton">
                    <div />
                </div>
            )}
            <CheckoutButton
                additionalInitializationOptions={additionalInitializationOptions}
                integrations={[createStripeLinkV2CustomerStrategy]}
                {...props}
                onUnhandledError={handleUnhandledError}
            />
        </div>
    );
};

export default toResolvableComponent<CheckoutButtonProps, CheckoutButtonResolveId>(
    StripeLinkV2Button,
    [{ id: 'stripeocs' }],
);
