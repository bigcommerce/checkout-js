import { Checkout } from '@bigcommerce/checkout-sdk';

import { OrderSummarySubtotalsProps } from '../order';
import { hasSelectedShippingOptions } from '../shipping';

export default function mapToOrderSummarySubtotalsProps({
    subtotal,
    cart: { discountAmount },
    giftCertificates,
    consignments,
    handlingCostTotal,
    shippingCostBeforeDiscount,
    coupons,
    taxes,
}: Checkout): OrderSummarySubtotalsProps {
    return {
        subtotalAmount: subtotal,
        discountAmount,
        giftCertificates,
        shippingAmount: hasSelectedShippingOptions(consignments) ?
            shippingCostBeforeDiscount :
            undefined,
        handlingAmount: handlingCostTotal,
        coupons,
        taxes,
    };
}
