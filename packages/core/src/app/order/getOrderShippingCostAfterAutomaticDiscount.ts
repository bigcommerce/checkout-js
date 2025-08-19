import { type OrderShippingConsignment } from "@bigcommerce/checkout-sdk";

export default function getOrderShippingCostAfterAutomaticDiscount(shippingCostBeforeDiscount: number, consignments: OrderShippingConsignment[]) {
    return consignments.reduce((total, consignment) => {
        return total - getTotalAutomaticDiscount(consignment);
    }, shippingCostBeforeDiscount);
}

function getTotalAutomaticDiscount(consignment: OrderShippingConsignment) {
    return consignment.discounts
    .filter(discount => !discount.code)
    .reduce((total, discount) => total + discount.amount, 0);
}
