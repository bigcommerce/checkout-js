import { createBigCommercePaymentsCustomerStrategy } from '@bigcommerce/checkout-sdk/integrations/bigcommerce-payments';
import React, { type FunctionComponent } from 'react';

import { CheckoutButton } from '@bigcommerce/checkout/checkout-button-integration';
import {
    type CheckoutButtonProps,
    type CheckoutButtonResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';
import { navigateToOrderConfirmation } from '@bigcommerce/checkout/utility';

const BigCommercePaymentsButton: FunctionComponent<CheckoutButtonProps> = (props) => {
    const additionalInitializationOptions = {
        onComplete: navigateToOrderConfirmation,
        onError: props.onUnhandledError,
    };

    return (
        <CheckoutButton
            additionalInitializationOptions={additionalInitializationOptions}
            integrations={[createBigCommercePaymentsCustomerStrategy]}
            {...props}
        />
    );
};

export default toResolvableComponent<CheckoutButtonProps, CheckoutButtonResolveId>(
    BigCommercePaymentsButton,
    [{ id: 'bigcommerce_payments' }],
);
