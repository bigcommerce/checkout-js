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
    isNewMultiShippingUIEnabled: boolean;
} & RedeemableProps;

const CartSummary: FunctionComponent<
    WithCheckoutCartSummaryProps & {
        isMultiShippingMode: boolean;
    }
> = ({ cartUrl, isMultiShippingMode, isNewMultiShippingUIEnabled, ...props }) => {
    const headerLink = isBuyNowCart() ? null : (
        <EditLink
            isMultiShippingMode={isNewMultiShippingUIEnabled && isMultiShippingMode}
            url={cartUrl}
        />
    );

    return withRedeemable(OrderSummary)({
        ...props,
        cartUrl,
        headerLink,
        isNewMultiShippingUIEnabled,
    });
};

export default withCheckout(mapToCartSummaryProps)(CartSummary);
