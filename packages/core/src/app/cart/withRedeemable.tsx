import React, { type ComponentType, type FunctionComponent } from 'react';

import { type OrderSummaryProps, type OrderSummarySubtotalsProps } from '../order';

import { type WithCheckoutCartSummaryProps } from './CartSummary';
import mapToOrderSummarySubtotalsProps from './mapToOrderSummarySubtotalsProps';
import Redeemable from './Redeemable';

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
            onRemovedCoupon,
            onRemovedGiftCertificate,
            storeCreditAmount,
            isShippingDiscountDisplayEnabled,
            ...redeemableProps
        } = props;

        return (
            <OriginalComponent
                {...mapToOrderSummarySubtotalsProps(checkout, isShippingDiscountDisplayEnabled)}
                additionalLineItems={
                    <Redeemable
                        {...{
                            ...redeemableProps,
                            onRemovedCoupon,
                            onRemovedGiftCertificate,
                        }}
                    />
                }
                headerLink={headerLink}
                lineItems={checkout.cart.lineItems}
                onRemovedCoupon={onRemovedCoupon}
                onRemovedGiftCertificate={onRemovedGiftCertificate}
                shopperCurrency={shopperCurrency}
                showHeader={showHeader}
                storeCreditAmount={storeCreditAmount}
                storeCurrency={storeCurrency}
                total={checkout.outstandingBalance}
            />
        );
    };
}
