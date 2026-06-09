import React, { type FunctionComponent, memo } from 'react';

import { withCheckout } from '../checkout';
import OrderSummaryDrawer from '../order/OrderSummaryDrawer';

import { CartHeaderLink } from './CartHeaderLink';
import { type WithCheckoutCartSummaryProps } from './CartSummary';
import mapToCartSummaryProps from './mapToCartSummaryProps';
import withRedeemable from './withRedeemable';

const CartSummaryDrawer: FunctionComponent<
    WithCheckoutCartSummaryProps & {
        isMultiShippingMode: boolean;
    }
> = ({ cartUrl, isMultiShippingMode, isBuyNowCart, ...props }) => {
    return withRedeemable(OrderSummaryDrawer)({
        ...props,
        isBuyNowCart,
        cartUrl,
        headerLink: (
            <CartHeaderLink
                cartUrl={cartUrl}
                className="modal-header-link cart-modal-link"
                isBuyNowCart={isBuyNowCart}
                isMultiShippingMode={isMultiShippingMode}
            />
        ),
    });
};

export default withCheckout(mapToCartSummaryProps)(memo(CartSummaryDrawer));
