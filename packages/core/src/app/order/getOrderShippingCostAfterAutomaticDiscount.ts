import { OrderShippingConsignment } from "@bigcommerce/checkout-sdk";

export default function getOrderShippingCostAfterAutomaticDiscount(shippingCostBeforeDiscount: number, consignments: OrderShippingConsignment[]) {
    return consignments.reduce((total, consignment) => {
        return total - getTotalAutomaticDiscount(consignment);
    }, shippingCostBeforeDiscount);
}

function getTotalAutomaticDiscount(consignment: OrderShippingConsignment) {
    return consignment.discounts.reduce((discountTotal, discount) => {
        return !discount.code ? discountTotal + discount.amount : discountTotal;
    }, 0);
}
