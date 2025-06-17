import { Checkout, ShopperCurrency, StoreCurrency } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent } from 'react';

import { withCheckout } from '../checkout';
import { isBuyNowCart } from '../common/utility';
import OrderSummary from '../order/OrderSummary';

import EditLink from './EditLink';
import mapToCartSummaryProps from './mapToCartSummaryProps';
import { RedeemableProps } from './Redeemable';
import withRedeemable from './withRedeemable';

export type WithCheckoutCartSummaryProps = {
    checkout: Checkout;
    cartUrl: string;
    storeCurrency: StoreCurrency;
    shopperCurrency: ShopperCurrency;
    storeCreditAmount?: number;
    isShippingDiscountDisplayEnabled: boolean;
} & RedeemableProps;

const CartSummary: FunctionComponent<
    WithCheckoutCartSummaryProps & {
        isMultiShippingMode: boolean;
    }
    > = ({ cartUrl, isMultiShippingMode, ...props }) => {
    const headerLink = isBuyNowCart() ? null : (
        <EditLink
            isMultiShippingMode={isMultiShippingMode}
            url={"http://ssdinternationalinc.com/cart"}
        />
    );

    return withRedeemable(OrderSummary)({
        ...props,
        cartUrl,
        headerLink,
    });
};

export default withCheckout(mapToCartSummaryProps)(CartSummary);
