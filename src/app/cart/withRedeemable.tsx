import React, { ComponentType, FunctionComponent } from 'react';

import { OrderSummaryProps, OrderSummarySubtotalsProps } from '../order';

import mapToOrderSummarySubtotalsProps from './mapToOrderSummarySubtotalsProps';
import { WithCheckoutCartSummaryProps } from './CartSummary';
import Redeemable from './Giftcard';

export default function withRedeemable(
    OriginalComponent: ComponentType<OrderSummaryProps & OrderSummarySubtotalsProps>
): FunctionComponent<
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
//        console.log('order summary:'+JSON.stringify(checkout))

        // console.log('subtotal:'+checkout.subtotal)
        // console.log('email:'+checkout.cart.email)
        // console.log('Name:'+checkout.billingAddress?.firstName+' '+checkout.billingAddress?.lastName)

        return (
            <OriginalComponent
                { ...mapToOrderSummarySubtotalsProps(checkout) }
                additionalLineItems={
                    <Redeemable { ...{
                        ...redeemableProps,
                        checkout,
                        onRemovedCoupon,
                        onRemovedGiftCertificate,
                    } }
                    />
                }
                headerLink={ headerLink }
                lineItems={ checkout.cart.lineItems }
                onRemovedCoupon={ onRemovedCoupon }
                onRemovedGiftCertificate={ onRemovedGiftCertificate }
                shopperCurrency={ shopperCurrency }
                storeCreditAmount={ storeCreditAmount }
                storeCurrency={ storeCurrency }
                total={ checkout.outstandingBalance }
            />
        );
    };
}
