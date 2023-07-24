import { Cart, Consignment } from '@bigcommerce/checkout-sdk';
import React, { memo } from 'react';

import { useCheckout } from '@bigcommerce/checkout/payment-integration-api';

import { PaymentMethodId } from '../payment/paymentMethod';

import PayPalAxoStaticConsignment from './PayPalAxo/PayPalAxoStaticConsignment';
import StaticConsignment from './StaticConsignment';

interface ShippingSummaryProps {
    consignment: Consignment;
    cart: Cart;
    compactView?: boolean;
}

const ShippingSummary = ({
    consignment,
    cart,
    compactView,
}: ShippingSummaryProps) => {
    const { checkoutState } = useCheckout();
    const { data: { getConfig } } = checkoutState;
    const providerWithCustomCheckout = getConfig()?.checkoutSettings?.providerWithCustomCheckout;

    if (providerWithCustomCheckout === PaymentMethodId.BraintreeAcceleratedCheckout) {
        return <PayPalAxoStaticConsignment
            cart={cart}
            compactView={compactView}
            consignment={consignment}
        />;
    }

    return (
        <StaticConsignment
            cart={cart}
            compactView={compactView}
            consignment={consignment}
        />
    );
};

export default memo(ShippingSummary);
 