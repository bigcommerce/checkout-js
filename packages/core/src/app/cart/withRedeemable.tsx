import React, { type ComponentType, type FunctionComponent } from 'react';

import { type OrderSummarySubtotalsProps } from '../coupon';
import { type OrderSummaryProps } from '../order';

import { type WithCheckoutCartSummaryProps } from './CartSummary';
import mapToOrderSummarySubtotalsProps from './mapToOrderSummarySubtotalsProps';

export default function withRedeemable(
    OriginalComponent: ComponentType<OrderSummaryProps & OrderSummarySubtotalsProps>,
): FunctionComponent<WithCheckoutCartSummaryProps & { headerLink?: any; showHeader?: boolean }> {
    return (props) => {
        const {
            checkout,
            storeCurrency,
            shopperCurrency,
            headerLink,
            showHeader,
            storeCreditAmount,
        } = props;

        return (
            <OriginalComponent
                {...mapToOrderSummarySubtotalsProps(checkout)}
                headerLink={headerLink}
                lineItems={checkout.cart.lineItems}
                shopperCurrency={shopperCurrency}
                showHeader={showHeader}
                storeCreditAmount={storeCreditAmount}
                storeCurrency={storeCurrency}
                total={checkout.outstandingBalance}
            />
        );
    };
}
