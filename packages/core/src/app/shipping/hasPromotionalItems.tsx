import { type Cart } from '@bigcommerce/checkout-sdk';

export default function hasPromotionalItems(cart: Cart): boolean {
    const { digitalItems = [], physicalItems } = cart.lineItems;
    
    return [...digitalItems, ...physicalItems].filter((item) => item.addedByPromotion)?.length > 0;
}
