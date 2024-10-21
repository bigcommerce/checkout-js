import React, { FunctionComponent, memo } from 'react';

import { withCheckout } from '../checkout';
import OrderSummaryDrawer from '../order/OrderSummaryDrawer';

import { WithCheckoutCartSummaryProps } from './CartSummary';
import EditLink from './EditLink';
import mapToCartSummaryProps from './mapToCartSummaryProps';
import withRedeemable from './withRedeemable';

const CartSummaryDrawer: FunctionComponent<
    WithCheckoutCartSummaryProps & {
        isMultiShippingMode: boolean;
    }
> = ({ cartUrl, isMultiShippingMode, isNewMultiShippingUIEnabled, ...props }) =>
    withRedeemable(OrderSummaryDrawer)({
        ...props,
        cartUrl,
        headerLink: (
            <EditLink
                className="modal-header-link cart-modal-link"
                isMultiShippingMode={isNewMultiShippingUIEnabled && isMultiShippingMode}
                url={cartUrl}
            />
        ),
        isNewMultiShippingUIEnabled,
    });

export default withCheckout(mapToCartSummaryProps)(memo(CartSummaryDrawer));
