import React, { FunctionComponent } from 'react';

import { withCheckout } from '../checkout';
import { OrderSummaryDrawer } from '../order';

import mapToCartSummaryProps from './mapToCartSummaryProps';
import withRedeemable from './withRedeemable';
import { CartSummaryProps, WithCheckoutCartSummaryProps } from './CartSummary';
import EditLink from './EditLink';

const CartSummaryDrawer: FunctionComponent<CartSummaryProps & WithCheckoutCartSummaryProps> = ({
    cartUrl,
    ...props
}) => (
    withRedeemable(OrderSummaryDrawer)({
        ...props,
        cartUrl,
        headerLink: (
            <EditLink
                className="modal-header-link cart-modal-link"
                url={ cartUrl }
            />
        ),
    })
);

export default withCheckout(mapToCartSummaryProps)(CartSummaryDrawer);
