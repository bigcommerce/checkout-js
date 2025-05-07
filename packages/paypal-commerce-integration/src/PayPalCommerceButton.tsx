import React, { FunctionComponent } from 'react';

import { CheckoutButton } from '@bigcommerce/checkout/checkout-button-integration';
import { CheckoutButtonProps } from '@bigcommerce/checkout/payment-integration-api';

const PayPalCommerceButton: FunctionComponent<CheckoutButtonProps> = ({
    methodId,
    ...rest
}) => {
    return <CheckoutButton methodId={methodId} {...rest} />;
};

export default PayPalCommerceButton;
