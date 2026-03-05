import { type Checkout } from '@bigcommerce/checkout-sdk';

import { type OrderSummarySubtotalsProps } from '../order';
import { hasSelectedShippingOptions } from '../shipping';

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
    comparisonShippingCost,
}: Checkout,
    isShippingDiscountDisplayEnabled: boolean,
): OrderSummarySubtotalsProps {
    const allConsignmentsHaveSelectedShippingOption = hasSelectedShippingOptions(consignments);

    const shippingAmount = allConsignmentsHaveSelectedShippingOption
        ? isShippingDiscountDisplayEnabled
            ? comparisonShippingCost
            : shippingCostBeforeDiscount
        : undefined;

    return {
        subtotalAmount: subtotal,
        discountAmount,
        giftCertificates,
        giftWrappingAmount: giftWrappingCostTotal,
        shippingAmount,
        shippingAmountBeforeDiscount: isShippingDiscountDisplayEnabled && allConsignmentsHaveSelectedShippingOption
            ? shippingCostBeforeDiscount
            : undefined,
        handlingAmount: handlingCostTotal,
        coupons,
        taxes,
        fees,
        isTaxIncluded,
    };
}
