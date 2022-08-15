import { Address, Cart, Consignment } from '@bigcommerce/checkout-sdk';

import { isEqualAddress } from '../address';

import findConsignment from './findConsignment';
import ShippableItem from './ShippableItem';

export interface UpdateItemParams {
    updatedItemIndex: number;
    address: Address;
}

export default function updateShippableItems(
    items: ShippableItem[],
    { updatedItemIndex, address }: UpdateItemParams,
    { cart, consignments }: { cart?: Cart; consignments?: Consignment[] },
): ShippableItem[] | undefined {
    if (updatedItemIndex < 0 || updatedItemIndex >= items.length || !cart) {
        return;
    }

    const cartItemIds = cart.lineItems.physicalItems.map(({ id }) => id);

    const updatedConsignment = (consignments || []).find((consignment) =>
        isEqualAddress(consignment.shippingAddress, address),
    );

    const newId = findNewItemId(items[updatedItemIndex], cart, updatedConsignment);

    return items.map((item, i) => {
        if ((newId && !cartItemIds.includes(item.id)) || i === updatedItemIndex) {
            const itemId = newId ?? item.id;

            return {
                ...item,
                id: itemId,
                consignment: findConsignment(consignments || [], itemId as string),
            };
        }

        return item;
    });
}

function findNewItemId(
    item: ShippableItem,
    cart?: Cart,
    consignment?: Consignment,
): string | undefined {
    if (!cart || !consignment) {
        return;
    }

    const { physicalItems } = cart.lineItems;
    const matchingCartItems = physicalItems.filter(
        ({ productId, variantId }) => productId === item.productId && variantId === item.variantId,
    );

    const matchingCartItemIds = matchingCartItems.map(({ id }) => id);

    return consignment.lineItemIds.find((id) => matchingCartItemIds.includes(id));
}
