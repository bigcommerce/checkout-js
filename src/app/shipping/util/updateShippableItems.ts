import { Address, Cart, Consignment } from '@bigcommerce/checkout-sdk';

import { isEqualAddress } from '../../address';
import ShippableItem from '../ShippableItem';

import findConsignment from './findConsignment';

export interface UpdateItemParams {
    updatedItemIndex: number;
    address: Address;
}

export default function updateShippableItems(
    items: ShippableItem[],
    { updatedItemIndex, address }: UpdateItemParams,
    { cart, consignments }: { cart?: Cart; consignments?: Consignment[] }
): ShippableItem[] | undefined {
    if (updatedItemIndex < 0 || updatedItemIndex >= items.length || !cart) {
        return;
    }

    const cartItemIds = cart.lineItems.physicalItems.map(({ id }) => id);

    const updatedConsignment = (consignments || []).find(consignment =>
        isEqualAddress(consignment.shippingAddress, address)
    );

    const newId = findNewItemId(items[updatedItemIndex], cart, updatedConsignment);
    const updatedItems: ShippableItem[] = [];

    items.forEach((item, i) => {
        const id = newId && (i === updatedItemIndex || !cartItemIds.includes(item.id)) ?
            newId : item.id;

        updatedItems[i] = {
            ...item,
            id,
            consignment: findConsignment(consignments || [], id  as string),
        };
    });

    return updatedItems;
}

function findNewItemId(item: ShippableItem, cart?: Cart, consignment?: Consignment): string | undefined {
    if (!cart || !consignment) {
        return;
    }

    const { physicalItems } = cart.lineItems;
    const matchingCartItems = physicalItems.filter(
        ({ productId, variantId }) => productId === item.productId && variantId === item.variantId
    );

    const matchingCartItemIds = matchingCartItems.map(({ id }) => id);

    return consignment.lineItemIds.find(id => matchingCartItemIds.includes(id));
}
