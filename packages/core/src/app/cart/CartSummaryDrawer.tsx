import React, { type FunctionComponent, memo } from 'react';

import { withCheckout } from '../checkout';
import OrderSummaryDrawer from '../order/OrderSummaryDrawer';

import { type WithCheckoutCartSummaryProps } from './CartSummary';
import EditLink from './EditLink';
import mapToCartSummaryProps from './mapToCartSummaryProps';
import withRedeemable from './withRedeemable';

const CartSummaryDrawer: FunctionComponent<
    WithCheckoutCartSummaryProps & {
        isMultiShippingMode: boolean;
    }
    > = ({ cartUrl, isMultiShippingMode, isBuyNowCart, ...props }) =>
    withRedeemable(OrderSummaryDrawer)({
        ...props,
        isBuyNowCart,
        cartUrl,
        headerLink: isBuyNowCart ? <div /> : (
            <EditLink
                className="modal-header-link cart-modal-link"
                isMultiShippingMode={isMultiShippingMode}
                url={cartUrl}
            />
        ),
    });

export default withCheckout(mapToCartSummaryProps)(memo(CartSummaryDrawer));
