import {
    type CustomItem,
    type DigitalItem,
    type GiftCertificateItem,
    type PhysicalItem,
} from '@bigcommerce/checkout-sdk';

import { getDigitalItem, getPhysicalItem } from '../cart/lineItem.mock';

import {
    buildBundleItemsMapFromOrder,
    removeAndBundleItemsTogether,
    removeBundledItems,
} from './removeBundledItems';

const emptyLineItems = {
    physicalItems: [] as PhysicalItem[],
    digitalItems: [] as DigitalItem[],
    giftCertificates: [] as GiftCertificateItem[],
    customItems: null as unknown as CustomItem[],
};

describe('buildBundleItemsMapFromOrder()', () => {
    const emptyBundledItems = {
        physicalItems: [] as PhysicalItem[],
        digitalItems: [] as DigitalItem[],
    };

    describe('when there are no items', () => {
        it('returns empty map and unchanged lineItems', () => {
            const { nonBundledItems, bundleItemsMap } = buildBundleItemsMapFromOrder(
                emptyLineItems,
                emptyBundledItems,
            );

            expect(nonBundledItems).toEqual(emptyLineItems);
            expect(bundleItemsMap.size).toBe(0);
        });
    });

    describe('when a physical child is linked to a parent via attributeId', () => {
        const parent = {
            ...getPhysicalItem(),
            id: 'parent-1',
            options: [
                { name: 'Color', nameId: 10, value: 'Red', valueId: 20, attributeId: 'attr-1' },
            ],
        };
        const child = { ...getPhysicalItem(), id: 'child-1', addedByAttributeId: 'attr-1' };
        const lineItems = { ...emptyLineItems, physicalItems: [parent] };
        const orderBundledItems = { ...emptyBundledItems, physicalItems: [child] };

        it('maps the child under the parent id', () => {
            const { bundleItemsMap } = buildBundleItemsMapFromOrder(lineItems, orderBundledItems);

            expect(bundleItemsMap.size).toBe(1);

            const children = bundleItemsMap.get('parent-1');

            expect(children).toHaveLength(1);
            expect(children![0].id).toBe('child-1');
        });

        it('keeps the parent in nonBundledItems', () => {
            const { nonBundledItems } = buildBundleItemsMapFromOrder(lineItems, orderBundledItems);

            expect(nonBundledItems.physicalItems).toHaveLength(1);
            expect(nonBundledItems.physicalItems[0].id).toBe('parent-1');
        });
    });

    describe('when a digital child is linked to a digital parent', () => {
        const parent = {
            ...getDigitalItem(),
            id: 'parent-d',
            options: [
                { name: 'Format', nameId: 11, value: 'PDF', valueId: 21, attributeId: 'attr-d' },
            ],
        };
        const child = { ...getDigitalItem(), id: 'child-d', addedByAttributeId: 'attr-d' };
        const lineItems = { ...emptyLineItems, digitalItems: [parent] };
        const orderBundledItems = { ...emptyBundledItems, digitalItems: [child] };

        it('maps the digital child under the parent id', () => {
            const { bundleItemsMap } = buildBundleItemsMapFromOrder(lineItems, orderBundledItems);

            const children = bundleItemsMap.get('parent-d');

            expect(children).toHaveLength(1);
            expect(children![0].id).toBe('child-d');
        });
    });

    describe('when a parent has multiple options each matching a different child', () => {
        const parent = {
            ...getPhysicalItem(),
            id: 'parent-multi',
            options: [
                { name: 'Size', nameId: 1, value: 'S', valueId: 1, attributeId: 'attr-a' },
                { name: 'Color', nameId: 2, value: 'Blue', valueId: 2, attributeId: 'attr-b' },
            ],
        };
        const childA = { ...getPhysicalItem(), id: 'child-a', addedByAttributeId: 'attr-a' };
        const childB = { ...getPhysicalItem(), id: 'child-b', addedByAttributeId: 'attr-b' };
        const lineItems = { ...emptyLineItems, physicalItems: [parent] };
        const orderBundledItems = { ...emptyBundledItems, physicalItems: [childA, childB] };

        it('groups all children under the parent id', () => {
            const { bundleItemsMap } = buildBundleItemsMapFromOrder(lineItems, orderBundledItems);

            const children = bundleItemsMap.get('parent-multi');

            expect(children).toHaveLength(2);
            expect(children!.map((c) => c.id)).toEqual(['child-a', 'child-b']);
        });
    });

    describe('when a bundle child has no addedByAttributeId', () => {
        const child = { ...getPhysicalItem(), id: 'orphan', addedByAttributeId: undefined };
        const lineItems = { ...emptyLineItems, physicalItems: [getPhysicalItem()] };
        const orderBundledItems = { ...emptyBundledItems, physicalItems: [child] };

        it('does not add an entry to the map', () => {
            const { bundleItemsMap } = buildBundleItemsMapFromOrder(lineItems, orderBundledItems);

            expect(bundleItemsMap.size).toBe(0);
        });
    });

    describe('when a parent option has no attributeId', () => {
        const parent = {
            ...getPhysicalItem(),
            id: 'parent-no-attr',
            options: [{ name: 'Size', nameId: 1, value: 'M', valueId: 2 }],
        };
        const child = { ...getPhysicalItem(), id: 'child-x', addedByAttributeId: 'attr-x' };
        const lineItems = { ...emptyLineItems, physicalItems: [parent] };
        const orderBundledItems = { ...emptyBundledItems, physicalItems: [child] };

        it('does not link the child', () => {
            const { bundleItemsMap } = buildBundleItemsMapFromOrder(lineItems, orderBundledItems);

            expect(bundleItemsMap.size).toBe(0);
        });
    });

    describe('when a bundle child also appears in lineItems (defensive filter)', () => {
        const parent = {
            ...getPhysicalItem(),
            id: 'parent-2',
            options: [{ name: 'n', nameId: 1, value: 'v', valueId: 3, attributeId: 'attr-2' }],
        };
        const child = { ...getPhysicalItem(), id: 'child-2', addedByAttributeId: 'attr-2' };
        const lineItems = { ...emptyLineItems, physicalItems: [parent, child] };
        const orderBundledItems = { ...emptyBundledItems, physicalItems: [child] };

        it('removes the child from nonBundledItems', () => {
            const { nonBundledItems } = buildBundleItemsMapFromOrder(lineItems, orderBundledItems);

            expect(nonBundledItems.physicalItems).toHaveLength(1);
            expect(nonBundledItems.physicalItems[0].id).toBe('parent-2');
        });
    });

    describe('when item ids are numeric', () => {
        const parent = {
            ...getPhysicalItem(),
            id: 100 as unknown as string,
            options: [{ name: 'n', nameId: 1, value: 'v', valueId: 3, attributeId: 'attr-num' }],
        };
        const child = {
            ...getPhysicalItem(),
            id: 200 as unknown as string,
            addedByAttributeId: 'attr-num',
        };
        const lineItems = { ...emptyLineItems, physicalItems: [parent] };
        const orderBundledItems = { ...emptyBundledItems, physicalItems: [child] };

        it('stringifies ids so map lookup works', () => {
            const { bundleItemsMap } = buildBundleItemsMapFromOrder(lineItems, orderBundledItems);

            expect(bundleItemsMap.get('100')).toBeDefined();
            expect(bundleItemsMap.get('100')![0].id).toBe(200);
        });
    });
});

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
