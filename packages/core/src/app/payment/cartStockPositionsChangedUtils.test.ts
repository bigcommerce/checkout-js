import { type Consignment, type PhysicalItem } from '@bigcommerce/checkout-sdk';

import { getCart } from '../cart/carts.mock';
import { getPhysicalItem, getPicklistItem } from '../cart/lineItem.mock';
import { getConsignment } from '../shipping/consignment.mock';

import {
    getChangedItemsToShow,
    groupChangedItemsByConsignment,
} from './cartStockPositionsChangedUtils';

describe('cartStockPositionsChangedUtils', () => {
    describe('getChangedItemsToShow()', () => {
        it('returns empty array when cart is undefined', () => {
            expect(getChangedItemsToShow(undefined, ['666'])).toEqual([]);
        });

        it('returns empty array when changedLineItemIds is undefined', () => {
            expect(getChangedItemsToShow(getCart(), undefined)).toEqual([]);
        });

        it('returns empty array when changedLineItemIds is empty', () => {
            expect(getChangedItemsToShow(getCart(), [])).toEqual([]);
        });

        it('returns empty array when changedLineItemIds is not an array (e.g. malformed string from backend)', () => {
            const item = getPhysicalItem();
            const cart = {
                ...getCart(),
                lineItems: {
                    ...getCart().lineItems,
                    physicalItems: [item],
                },
            };
            // Backend could return a string or other non-array with .length; must not call .map() on it
            expect(getChangedItemsToShow(cart, '123' as unknown as Array<string | number>)).toEqual(
                [],
            );
        });

        it('returns matching physical items by changed line item ids', () => {
            const item = getPhysicalItem();
            const cart = {
                ...getCart(),
                lineItems: {
                    ...getCart().lineItems,
                    physicalItems: [item],
                },
            };

            expect(getChangedItemsToShow(cart, [item.id])).toEqual([item]);
        });

        it('returns only items that exist in cart and are in changedLineItemIds', () => {
            const item1 = { ...getPhysicalItem(), id: '1' };
            const item2 = { ...getPhysicalItem(), id: '2', name: 'Other' };
            const cart = {
                ...getCart(),
                lineItems: {
                    ...getCart().lineItems,
                    physicalItems: [item1, item2],
                },
            };

            expect(getChangedItemsToShow(cart, ['1', '999'])).toEqual([item1]);
        });

        it('resolves bundled items to parent and dedupes by parent id', () => {
            const [parent, child] = getPicklistItem();
            const cart = {
                ...getCart(),
                lineItems: {
                    ...getCart().lineItems,
                    physicalItems: getPicklistItem(),
                },
            };

            const result = getChangedItemsToShow(cart, [child.id as string]);

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe(parent.id);
            expect(result[0].name).toBe(parent.name);
        });

        it('dedupes when multiple changed ids map to same parent', () => {
            const [parent, child] = getPicklistItem();
            const cart = {
                ...getCart(),
                lineItems: {
                    ...getCart().lineItems,
                    physicalItems: getPicklistItem(),
                },
            };

            const result = getChangedItemsToShow(cart, [parent.id as string, child.id as string]);

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe(parent.id);
        });
    });

    describe('groupChangedItemsByConsignment()', () => {
        it('returns null when cart is undefined', () => {
            const consignments = [getConsignment(), { ...getConsignment(), id: 'other' }];
            const items: PhysicalItem[] = [getPhysicalItem()];

            expect(groupChangedItemsByConsignment(undefined, consignments, items)).toBeNull();
        });

        it('returns null when consignments is undefined', () => {
            expect(groupChangedItemsByConsignment(getCart(), undefined, [])).toBeNull();
        });

        it('returns null when consignments has at most one item', () => {
            const cart = getCart();
            const items: PhysicalItem[] = [getPhysicalItem()];

            expect(groupChangedItemsByConsignment(cart, [], items)).toBeNull();
            expect(
                groupChangedItemsByConsignment(cart, [getConsignment()], items),
            ).toBeNull();
        });

        it('returns null when no consignment has changed items', () => {
            const item1 = { ...getPhysicalItem(), id: '1' };
            const item2 = { ...getPhysicalItem(), id: '2' };
            const cart = {
                ...getCart(),
                lineItems: {
                    ...getCart().lineItems,
                    physicalItems: [item1, item2],
                },
            };
            const consignmentA = { ...getConsignment(), id: 'c1', lineItemIds: ['1'] };
            const consignmentB = { ...getConsignment(), id: 'c2', lineItemIds: ['2'] };
            const consignments: Consignment[] = [consignmentA, consignmentB];
            const changedItemsToShow: PhysicalItem[] = [];

            expect(
                groupChangedItemsByConsignment(cart, consignments, changedItemsToShow),
            ).toBeNull();
        });

        it('groups changed items by consignment and assigns destination numbers', () => {
            const item1 = { ...getPhysicalItem(), id: '1' };
            const item2 = { ...getPhysicalItem(), id: '2', name: 'Second' };
            const item3 = { ...getPhysicalItem(), id: '3', name: 'Third' };
            const cart = {
                ...getCart(),
                lineItems: {
                    ...getCart().lineItems,
                    physicalItems: [item1, item2, item3],
                },
            };
            const consignmentA = { ...getConsignment(), id: 'c1', lineItemIds: ['1'] };
            const consignmentB = { ...getConsignment(), id: 'c2', lineItemIds: ['2', '3'] };
            const consignments: Consignment[] = [consignmentA, consignmentB];
            const changedItemsToShow: PhysicalItem[] = [item1, item2];

            const result = groupChangedItemsByConsignment(
                cart,
                consignments,
                changedItemsToShow,
            );

            expect(result).not.toBeNull();
            expect(result).toHaveLength(2);

            expect(result![0].consignment).toBe(consignmentA);
            expect(result![0].consignmentNumber).toBe(1);
            expect(result![0].items).toEqual([item1]);

            expect(result![1].consignment).toBe(consignmentB);
            expect(result![1].consignmentNumber).toBe(2);
            expect(result![1].items).toEqual([item2]);
        });

        it('skips consignments with no changed items when assigning destination numbers', () => {
            const item1 = { ...getPhysicalItem(), id: '1' };
            const item3 = { ...getPhysicalItem(), id: '3', name: 'Third' };
            const cart = {
                ...getCart(),
                lineItems: {
                    ...getCart().lineItems,
                    physicalItems: [item1, { ...getPhysicalItem(), id: '2' }, item3],
                },
            };
            const consignmentA = { ...getConsignment(), id: 'c1', lineItemIds: ['1'] };
            const consignmentB = { ...getConsignment(), id: 'c2', lineItemIds: ['2'] };
            const consignmentC = { ...getConsignment(), id: 'c3', lineItemIds: ['3'] };
            const consignments: Consignment[] = [consignmentA, consignmentB, consignmentC];
            const changedItemsToShow: PhysicalItem[] = [item1, item3];

            const result = groupChangedItemsByConsignment(
                cart,
                consignments,
                changedItemsToShow,
            );

            expect(result).not.toBeNull();
            expect(result).toHaveLength(2);
            expect(result![0].consignmentNumber).toBe(1);
            expect(result![0].items).toEqual([item1]);
            expect(result![1].consignmentNumber).toBe(3);
            expect(result![1].items).toEqual([item3]);
        });
    });
});
