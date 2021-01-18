import { Order } from '@bigcommerce/checkout-sdk';

import { mapFromPayments } from '../giftCertificate';

import getStoreCreditAmount from './getStoreCreditAmount';
import { OrderSummarySubtotalsProps } from './OrderSummarySubtotals';

export default function mapToOrderSummarySubtotalsProps({
    baseAmount,
    discountAmount,
    shippingCostBeforeDiscount,
    payments,
    handlingCostTotal,
    giftWrappingCostTotal,
    coupons,
    taxes,
}: Order): OrderSummarySubtotalsProps {
    return {
        subtotalAmount: baseAmount,
        shippingAmount: shippingCostBeforeDiscount,
        giftWrappingAmount: giftWrappingCostTotal,
        discountAmount,
        storeCreditAmount: getStoreCreditAmount(payments),
        handlingAmount: handlingCostTotal,
        coupons,
        giftCertificates: payments && mapFromPayments(payments),
        taxes,
    };
}
