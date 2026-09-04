import { type Checkout } from '@bigcommerce/checkout-sdk';

import { type OrderSummarySubtotalsProps } from '../coupon';

export default function mapToOrderSummarySubtotalsProps({
    cart: { isTaxIncluded },
    handlingCostTotal,
    giftWrappingCostTotal,
    taxes,
    fees,
}: Checkout): OrderSummarySubtotalsProps {
    return {
        giftWrappingAmount: giftWrappingCostTotal,
        handlingAmount: handlingCostTotal,
        taxes,
        fees,
        isTaxIncluded,
    };
}
