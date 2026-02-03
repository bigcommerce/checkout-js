import { type Consignment } from '@bigcommerce/checkout-sdk';

export default function getShippingCostAfterAutomaticDiscount(
  shippingCostBeforeDiscount: number,
  consignments: Consignment[],
) {
  return consignments.reduce(
    (total, consignment) => total - getTotalAutomaticDiscount(consignment),
    shippingCostBeforeDiscount,
  );
}

function getTotalAutomaticDiscount(consignment: Consignment) {
  return consignment.discounts.reduce(
    (discountTotal, discount) =>
      discount.type === 'AUTOMATIC' ? discountTotal + discount.amount : discountTotal,
    0,
  );
}
