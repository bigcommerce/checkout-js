import { Fee, OrderFee } from "@bigcommerce/checkout-sdk";

export default function isOrderFee(fee: OrderFee | Fee): fee is OrderFee {
  return Object.hasOwn(fee, 'customerDisplayName');
};
