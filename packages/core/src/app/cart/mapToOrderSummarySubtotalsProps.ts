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
}: Checkout,
isShippingDiscountDisplayEnabled: boolean,
): OrderSummarySubtotalsProps {
    const allConsignmentsHaveSelectedShippingOption = hasSelectedShippingOptions(consignments);

    if (!isShippingDiscountDisplayEnabled) {
        return {
            subtotalAmount: subtotal,
            discountAmount,
            giftCertificates,
            giftWrappingAmount: giftWrappingCostTotal,
            shippingAmount: hasSelectedShippingOptions(consignments)
                ? shippingCostBeforeDiscount
                : undefined,
            handlingAmount: handlingCostTotal,
            coupons,
            taxes,
            fees,
            isTaxIncluded,
        };
    }

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
