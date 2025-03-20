import { Checkout } from '@bigcommerce/checkout-sdk';

import { OrderSummarySubtotalsProps } from '../order';
import { getShippingAmountAfterAutomaticDiscount, hasSelectedShippingOptions } from '../shipping';

export default function mapToOrderSummarySubtotalsProps({
    subtotal,
    cart: { discountAmount, isTaxIncluded },
    giftCertificates,
    consignments,
    handlingCostTotal,
    shippingCostBeforeDiscount,
    giftWrappingCostTotal,
    coupons,
    taxes,
    fees,
}: Checkout): OrderSummarySubtotalsProps {
    const allConsignmentsHaveSelectedShippingOption = hasSelectedShippingOptions(consignments);

    return {
        subtotalAmount: subtotal,
        discountAmount,
        giftCertificates,
        giftWrappingAmount: giftWrappingCostTotal,
        shippingAmount: allConsignmentsHaveSelectedShippingOption
            ? getShippingAmountAfterAutomaticDiscount(shippingCostBeforeDiscount, consignments)
            : undefined,
        shippingAmountBeforeDiscount: allConsignmentsHaveSelectedShippingOption
        ? shippingCostBeforeDiscount
        : undefined,
        handlingAmount: handlingCostTotal,
        coupons,
        taxes,
        fees,
        isTaxIncluded,
    };
}
