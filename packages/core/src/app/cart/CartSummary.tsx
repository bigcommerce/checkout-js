import { type Checkout, type ShopperCurrency, type StoreCurrency } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent } from 'react';

import { withCheckout } from '../checkout';
import OrderSummary from '../order/OrderSummary';

import { CartHeaderLink } from './CartHeaderLink';
import mapToCartSummaryProps from './mapToCartSummaryProps';
import withRedeemable from './withRedeemable';

export interface WithCheckoutCartSummaryProps {
    checkout: Checkout;
    cartUrl: string;
    storeCurrency: StoreCurrency;
    shopperCurrency: ShopperCurrency;
    storeCreditAmount?: number;
    isBuyNowCart: boolean;
}

const CartSummary: FunctionComponent<
    WithCheckoutCartSummaryProps & {
        isMultiShippingMode: boolean;
    }
> = ({ cartUrl, isMultiShippingMode, isBuyNowCart, ...props }) => {
    return withRedeemable(OrderSummary)({
        ...props,
        cartUrl,
        isBuyNowCart,
        headerLink: (
            <CartHeaderLink
                cartUrl={cartUrl}
                isBuyNowCart={isBuyNowCart}
                isMultiShippingMode={isMultiShippingMode}
            />
        ),
    });
};

export default withCheckout(mapToCartSummaryProps)(CartSummary);
