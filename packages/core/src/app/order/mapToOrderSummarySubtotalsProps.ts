import { type Order } from '@bigcommerce/checkout-sdk';

import { type OrderSummarySubtotalsProps } from '../coupon';

import getStoreCreditAmount from './getStoreCreditAmount';

export default function mapToOrderSummarySubtotalsProps({
    isTaxIncluded,
    payments,
    handlingCostTotal,
    giftWrappingCostTotal,
    taxes,
    fees,
}: Order): OrderSummarySubtotalsProps {
    return {
        giftWrappingAmount: giftWrappingCostTotal,
        storeCreditAmount: getStoreCreditAmount(payments),
        handlingAmount: handlingCostTotal,
        taxes,
        isTaxIncluded,
        fees,
    };
}
