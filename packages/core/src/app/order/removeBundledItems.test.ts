import {
    type CustomItem,
    type DigitalItem,
    type GiftCertificateItem,
    type PhysicalItem,
} from '@bigcommerce/checkout-sdk';

import { getDigitalItem, getPhysicalItem } from '../cart/lineItem.mock';

import { removeAndBundleItemsTogether, removeBundledItems } from './removeBundledItems';

const emptyLineItems = {
    physicalItems: [] as PhysicalItem[],
    digitalItems: [] as DigitalItem[],
    giftCertificates: [] as GiftCertificateItem[],
    customItems: null as unknown as CustomItem[],
};

describe('removeBundledItems()', () => {
    describe('when there are no items', () => {
        it('returns zero', () => {
            expect(removeBundledItems(emptyLineItems)).toEqual(emptyLineItems);
        });
    });

    describe('when there are items with parentId', () => {
        const items = {
            ...emptyLineItems,
            physicalItems: [{ ...getPhysicalItem(), parentId: '123-abc' }],
        };

        it('removes items with parentId', () => {
            expect(removeBundledItems(items)).toEqual(emptyLineItems);
        });
    });

    describe('when there are items without parentId', () => {
        const items = { ...emptyLineItems, physicalItems: [getPhysicalItem()] };

        it('keeps all items', () => {
            expect(removeBundledItems(items)).toEqual(items);
        });
    });
});

describe('removeAndBundleItemsTogether()', () => {
    describe('when there are no items', () => {
        it('returns empty nonBundledItems and empty map', () => {
            const { nonBundledItems, bundleItemsMap } =
                removeAndBundleItemsTogether(emptyLineItems);

            expect(nonBundledItems).toEqual(emptyLineItems);
            expect(bundleItemsMap.size).toBe(0);
        });
    });

    describe('when all items have no parentId', () => {
        const items = { ...emptyLineItems, physicalItems: [getPhysicalItem()] };

        it('keeps all items in nonBundledItems and map is empty', () => {
            const { nonBundledItems, bundleItemsMap } = removeAndBundleItemsTogether(items);

            expect(nonBundledItems.physicalItems).toHaveLength(1);
            expect(bundleItemsMap.size).toBe(0);
        });
    });

    describe('when a physical item has a parentId', () => {
        const parent = getPhysicalItem();
        const child = { ...getPhysicalItem(), id: '777', parentId: String(parent.id) };
        const items = { ...emptyLineItems, physicalItems: [parent, child] };

        it('removes the child from nonBundledItems', () => {
            const { nonBundledItems } = removeAndBundleItemsTogether(items);

            expect(nonBundledItems.physicalItems).toHaveLength(1);
            expect(nonBundledItems.physicalItems[0].id).toBe(parent.id);
        });

        it('adds the child to the map under the parent id key', () => {
            const { bundleItemsMap } = removeAndBundleItemsTogether(items);

            expect(bundleItemsMap.size).toBe(1);
            const children = bundleItemsMap.get(String(parent.id));

            expect(children).toHaveLength(1);
            expect(children![0].id).toBe('777');
        });
    });

    describe('when multiple children share the same parentId', () => {
        const parent = getPhysicalItem();
        const child1 = { ...getPhysicalItem(), id: '777', parentId: String(parent.id) };
        const child2 = { ...getPhysicalItem(), id: '888', parentId: String(parent.id) };
        const items = { ...emptyLineItems, physicalItems: [parent, child1, child2] };

        it('groups all children under the same map key', () => {
            const { nonBundledItems, bundleItemsMap } = removeAndBundleItemsTogether(items);

            expect(nonBundledItems.physicalItems).toHaveLength(1);
            const children = bundleItemsMap.get(String(parent.id));

            expect(children).toHaveLength(2);
        });
    });

    describe('when a digital item has a parentId', () => {
        const parent = getDigitalItem();
        const child = { ...getDigitalItem(), id: '999', parentId: String(parent.id) };
        const items = { ...emptyLineItems, digitalItems: [parent, child] };

        it('removes the child from nonBundledItems and adds it to the map', () => {
            const { nonBundledItems, bundleItemsMap } = removeAndBundleItemsTogether(items);

            expect(nonBundledItems.digitalItems).toHaveLength(1);
            expect(nonBundledItems.digitalItems[0].id).toBe(parent.id);

            const children = bundleItemsMap.get(String(parent.id));

            expect(children).toHaveLength(1);
            expect(children![0].id).toBe('999');
        });
    });
});
