import { createBigCommercePaymentsPayLaterCustomerStrategy } from '@bigcommerce/checkout-sdk/integrations/bigcommerce-payments';
import React, { type FunctionComponent } from 'react';

import { CheckoutButton } from '@bigcommerce/checkout/checkout-button-integration';
import {
    type CheckoutButtonProps,
    type CheckoutButtonResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';
import { navigateToOrderConfirmation } from '@bigcommerce/checkout/utility';

const BigcommercePaymentsPayLaterButton: FunctionComponent<CheckoutButtonProps> = (props) => {
    const additionalInitializationOptions = {
        onComplete: navigateToOrderConfirmation,
        onError: props.onUnhandledError,
    };

    return (
        <CheckoutButton
            additionalInitializationOptions={additionalInitializationOptions}
            integrations={[createBigCommercePaymentsPayLaterCustomerStrategy]}
            {...props}
        />
    );
};

export default toResolvableComponent<CheckoutButtonProps, CheckoutButtonResolveId>(
    BigcommercePaymentsPayLaterButton,
    [{ id: 'bigcommerce_payments_paylater' }],
);
