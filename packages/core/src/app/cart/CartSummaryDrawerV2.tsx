import React, { type FunctionComponent } from 'react';

import { useCheckout } from '@bigcommerce/checkout/contexts';

import { OrderSummaryDrawerV2 } from '../order/OrderSummaryDrawerV2';

import { CartHeaderLink } from './CartHeaderLink';
import mapToCartSummaryProps from './mapToCartSummaryProps';
import withRedeemable from './withRedeemable';

interface CartSummaryDrawerV2Props {
    isMultiShippingMode: boolean;
}

const CartSummaryDrawerV2: FunctionComponent<CartSummaryDrawerV2Props> = ({
    isMultiShippingMode,
}) => {
    const checkoutContext = useCheckout();
    const props = mapToCartSummaryProps(checkoutContext);

    if (!props) {
        return null;
    }

    const { cartUrl, isBuyNowCart } = props;

    return withRedeemable(OrderSummaryDrawerV2)({
        ...props,
        headerLink: (
            <CartHeaderLink
                cartUrl={cartUrl}
                isBuyNowCart={isBuyNowCart}
                isMultiShippingMode={isMultiShippingMode}
            />
        ),
    });
};

export default CartSummaryDrawerV2;
