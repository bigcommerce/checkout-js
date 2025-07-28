import { createBigCommercePaymentsPayLaterCustomerStrategy } from '@bigcommerce/checkout-sdk/integrations';
import React, { FunctionComponent } from 'react';

import { CheckoutButton } from '@bigcommerce/checkout/checkout-button-integration';
import {
    CheckoutButtonProps,
    CheckoutButtonResolveId,
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
            {...props}
            integrations={[createBigCommercePaymentsPayLaterCustomerStrategy]}
        />
    );
};

export default toResolvableComponent<CheckoutButtonProps, CheckoutButtonResolveId>(
    BigcommercePaymentsPayLaterButton,
    [{ id: 'bigcommerce_payments_paylater' }],
);
