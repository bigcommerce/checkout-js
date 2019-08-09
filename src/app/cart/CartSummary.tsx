import {
    Checkout,
    ShopperCurrency,
    StoreCurrency,
} from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent } from 'react';

import { withCheckout } from '../checkout';
import { OrderSummary } from '../order';

import mapToCartSummaryProps from './mapToCartSummaryProps';
import withRedeemable from './withRedeemable';
import EditLink from './EditLink';
import { RedeemableProps } from './Redeemable';

export interface CartSummaryProps {
    storeCreditAmount?: number;
}

export type WithCheckoutCartSummaryProps = {
    checkout: Checkout;
    cartUrl: string;
    storeCurrency: StoreCurrency;
    shopperCurrency: ShopperCurrency;
} & RedeemableProps;

const CartSummary: FunctionComponent<CartSummaryProps & WithCheckoutCartSummaryProps> = ({
    cartUrl,
    ...props
}) => (
    withRedeemable(OrderSummary)({
        ...props,
        cartUrl,
        headerLink: (
            <EditLink url={ cartUrl } />
        ),
    })
);

export default withCheckout(mapToCartSummaryProps)(CartSummary);
