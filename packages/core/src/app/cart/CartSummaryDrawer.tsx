import React, { type FunctionComponent, memo } from 'react';
import { useCapabilities } from '@bigcommerce/checkout/contexts';
import { hideEditCartLink } from '@bigcommerce/checkout/utility';

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
    > = ({ cartUrl, isMultiShippingMode, isBuyNowCart, ...props }) => {
        const { userJourney: { disableEditCart } } = useCapabilities();
        return withRedeemable(OrderSummaryDrawer)({
            ...props,
            isBuyNowCart,
            cartUrl,
                headerLink: hideEditCartLink(isBuyNowCart, disableEditCart) ? null : (
                    <EditLink
                        className="modal-header-link cart-modal-link"
                        isMultiShippingMode={isMultiShippingMode}
                        url={cartUrl}
                    />
                ),
            });
    }

export default withCheckout(mapToCartSummaryProps)(memo(CartSummaryDrawer));
