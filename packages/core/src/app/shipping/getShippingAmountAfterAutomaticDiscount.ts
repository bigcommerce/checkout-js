import { Consignment } from "@bigcommerce/checkout-sdk";

export default function getShippingAmountAfterAutomaticDiscount(shippingCostBeforeDiscount: number, consignments: Consignment[]) {
    return consignments.reduce((total, consignment) => {
        return total - getTotalAutomaticDiscount(consignment);
    }, shippingCostBeforeDiscount);
}

function getTotalAutomaticDiscount(consignment: Consignment) {
    return consignment.discounts.reduce((discountTotal, discount) => {
        return discount.type === 'AUTOMATIC' ? discountTotal + Number(discount.amount) : discountTotal;
    }, 0);
}
