import React, { ComponentType, FunctionComponent } from 'react';

import { OrderSummarySubtotalsProps } from '../order';
import { OrderSummaryProps } from '../order/OrderSummary';

import mapToOrderSummarySubtotalsProps from './mapToOrderSummarySubtotalsProps';
import { CartSummaryProps, WithCheckoutCartSummaryProps } from './CartSummary';
import Redeemable from './Redeemable';

export default function withRedeemable(
    OriginalComponent: ComponentType<OrderSummaryProps & OrderSummarySubtotalsProps>
): FunctionComponent<
    CartSummaryProps &
    WithCheckoutCartSummaryProps &
    { headerLink?: any }
> {
    return props => {
        const {
            checkout,
            storeCurrency,
            shopperCurrency,
            headerLink,
            onRemovedCoupon,
            onRemovedGiftCertificate,
            storeCreditAmount,
            ...redeemableProps
        } = props;

        return (
            <OriginalComponent
                { ...mapToOrderSummarySubtotalsProps(checkout) }
                onRemovedCoupon={ onRemovedCoupon }
                onRemovedGiftCertificate={ onRemovedGiftCertificate }
                headerLink={ headerLink }
                storeCreditAmount={ storeCreditAmount }
                lineItems={ checkout.cart.lineItems }
                total={ checkout.grandTotal }
                storeCurrency={ storeCurrency }
                shopperCurrency={ shopperCurrency }
                additionalLineItems={
                    <Redeemable { ...{
                        ...redeemableProps,
                        onRemovedCoupon,
                        onRemovedGiftCertificate,
                    } } />
                }
            />
        );
    };
}
