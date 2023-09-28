import { Checkout } from '@bigcommerce/checkout-sdk';

import { OrderSummarySubtotalsProps } from '../order';
import { hasSelectedShippingOptions } from '../shipping';

export function getIsProd() {
    const storeHash: any = document.querySelector('[name=store-hash]')

    return !storeHash || storeHash.value !== 'fye9bswode'
}

const IS_PROD = getIsProd()
const PROMOTION_ID_AUTOSHIP_NEW_CUSTOMER= IS_PROD ? 428 : 36
const PROMOTION_ID_AUTOSHIP_EXISTING_CUSTOMER= IS_PROD ? 429 : 37

export default function mapToOrderSummarySubtotalsProps({
    subtotal,
    cart: { discountAmount, isTaxIncluded, lineItems },
    giftCertificates,
    consignments,
    handlingCostTotal,
    shippingCostBeforeDiscount,
    giftWrappingCostTotal,
    coupons,
    taxes,
    fees,
}: Checkout): OrderSummarySubtotalsProps {

    const allDiscounts = lineItems.physicalItems
      ?.map((li) => {
            const discounts = li.discounts;

            return discounts?.filter(
              (d: {name?: string; id?: number; discountedAmount: number}) =>
                d.id === PROMOTION_ID_AUTOSHIP_EXISTING_CUSTOMER ||
                d.id === PROMOTION_ID_AUTOSHIP_NEW_CUSTOMER
            );
        }
      )
      .flat();

    const autoshipDiscount =
      (allDiscounts
        ?.map((i) => i?.discountedAmount) ?? [])
        .filter(Boolean).reduce((m, amt) => m + amt, 0)


    return {
        subtotalAmount: subtotal,
        autoshipDiscount,
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
