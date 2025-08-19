import { type Order } from '@bigcommerce/checkout-sdk';

import { mapFromPayments } from '../giftCertificate';

import getOrderShippingCostAfterAutomaticDiscount from './getOrderShippingCostAfterAutomaticDiscount';
import getStoreCreditAmount from './getStoreCreditAmount';
import { type OrderSummarySubtotalsProps } from './OrderSummarySubtotals';

export default function mapToOrderSummarySubtotalsProps({
    baseAmount,
    discountAmount,
    isTaxIncluded,
    shippingCostBeforeDiscount,
    payments,
    handlingCostTotal,
    giftWrappingCostTotal,
    coupons,
    taxes,
    fees,
    consignments,
}: Order,
isShippingDiscountDisplayEnabled: boolean,
): OrderSummarySubtotalsProps {

    const shippingAmount = isShippingDiscountDisplayEnabled && consignments.shipping.length > 0
    ? getOrderShippingCostAfterAutomaticDiscount(shippingCostBeforeDiscount, consignments.shipping)
    : shippingCostBeforeDiscount;

    return {
        subtotalAmount: baseAmount,
        shippingAmount,
        shippingAmountBeforeDiscount: isShippingDiscountDisplayEnabled ? shippingCostBeforeDiscount : undefined,
        giftWrappingAmount: giftWrappingCostTotal,
        discountAmount,
        storeCreditAmount: getStoreCreditAmount(payments),
        handlingAmount: handlingCostTotal,
        coupons,
        giftCertificates: payments && mapFromPayments(payments),
        taxes,
        isTaxIncluded,
        fees,
    };
}
