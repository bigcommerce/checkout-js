import { type LineItemOption, type PhysicalItem } from '@bigcommerce/checkout-sdk';

import { getPhysicalItem } from '../cart/lineItem.mock';

import mapFromPhysical from './mapFromPhysical';

describe('mapFromPhysical()', () => {
    describe('without bundleItemsMap (legacy path)', () => {
        it('maps basic item fields', () => {
            const item = getPhysicalItem();
            const result = mapFromPhysical(item);

            expect(result.id).toBe(item.id);
            expect(result.name).toBe(item.name);
            expect(result.quantity).toBe(item.quantity);
        });

        it('formats options without colon separator', () => {
            const item = getPhysicalItem();
            const result = mapFromPhysical(item);

            expect(result.productOptions![0].content).toBe('n v');
        });

        it('returns no bundledItems', () => {
            const result = mapFromPhysical(getPhysicalItem());

            expect(result.bundledItems).toBeUndefined();
        });
    });

    describe('with pickListExperimentEnabled', () => {
        it('formats options with colon separator', () => {
            const item = {
                ...getPhysicalItem(),
                options: [
                    {
                        name: 'Color',
                        nameId: 10,
                        value: 'Red',
                        valueId: 1,
                        attributeId: 'attr-color',
                    },
                ] as LineItemOption[],
            };
            const result = mapFromPhysical(item, undefined, true);

            expect(result.productOptions![0].content).toBe('Color: Red');
        });

        it('filters out options matching a bundled item attributeId', () => {
            const child = {
                ...getPhysicalItem(),
                id: '777',
                parentId: '666',
                addedByAttributeId: 'attr-picklist',
            } as unknown as PhysicalItem;

            const parent = {
                ...getPhysicalItem(),
                id: '666',
                options: [
                    {
                        name: 'Color',
                        nameId: 10,
                        value: 'Blue',
                        valueId: 1,
                        attributeId: 'attr-color',
                    },
                    {
                        name: 'Pick List',
                        nameId: 11,
                        value: 'Item A',
                        valueId: 2,
                        attributeId: 'attr-picklist',
                    },
                ] as LineItemOption[],
            };

            const bundleItemsMap = new Map<string | number, PhysicalItem[]>([['666', [child]]]);

            const result = mapFromPhysical(parent, bundleItemsMap, true);

            expect(result.productOptions).toHaveLength(1);
            expect(result.productOptions![0].content).toBe('Color: Blue');
        });

        it('returns bundledItems with backorder details from stockPosition', () => {
            const child = {
                ...getPhysicalItem(),
                id: '777',
                name: 'Bundled Product',
                parentId: '666',
                addedByAttributeId: 'attr-picklist',
                stockPosition: {
                    quantityBackordered: 1,
                    quantityOnHand: 4,
                    quantityOutOfStock: 0,
                    backorderMessage: 'Available soon',
                },
            } as unknown as PhysicalItem;

            const parent = { ...getPhysicalItem(), id: '666' };

            const bundleItemsMap = new Map<string | number, PhysicalItem[]>([['666', [child]]]);

            const { bundledItems } = mapFromPhysical(parent, bundleItemsMap, true);

            expect(bundledItems).toHaveLength(1);
            expect(bundledItems![0].id).toBe('777');
            expect(bundledItems![0].name).toBe('Bundled Product');
            expect(bundledItems![0].quantityBackordered).toBe(1);
            expect(bundledItems![0].quantityOnHand).toBe(4);
            expect(bundledItems![0].backorderMessage).toBe('Available soon');
        });

        it('returns bundledItems with bundleLabel from the matching parent option', () => {
            const child = {
                ...getPhysicalItem(),
                id: '777',
                name: 'Bundled Product',
                parentId: '666',
                addedByAttributeId: 'attr-picklist',
            } as unknown as PhysicalItem;

            const parent = {
                ...getPhysicalItem(),
                id: '666',
                options: [
                    {
                        name: 'Pick List',
                        nameId: 11,
                        value: 'Item A',
                        valueId: 2,
                        attributeId: 'attr-picklist',
                    },
                ] as LineItemOption[],
            };

            const bundleItemsMap = new Map<string | number, PhysicalItem[]>([['666', [child]]]);

            const { bundledItems } = mapFromPhysical(parent, bundleItemsMap, true);

            expect(bundledItems).toHaveLength(1);
            expect(bundledItems![0].bundleLabel).toBe('Pick List');
        });

        it('returns no bundledItems when the item has no children', () => {
            const result = mapFromPhysical(getPhysicalItem(), new Map(), true);

            expect(result.bundledItems).toBeUndefined();
        });

        it('coerces numeric child id to string in bundledItems', () => {
            const child = {
                ...getPhysicalItem(),
                id: 999,
                parentId: '666',
                addedByAttributeId: 'attr-picklist',
            } as unknown as PhysicalItem;

            const bundleItemsMap = new Map<string | number, PhysicalItem[]>([['666', [child]]]);

            const { bundledItems } = mapFromPhysical(
                { ...getPhysicalItem(), id: '666' },
                bundleItemsMap,
                true,
            );

            expect(typeof bundledItems![0].id).toBe('string');
            expect(bundledItems![0].id).toBe('999');
        });
    });

    describe('without pickListExperimentEnabled', () => {
        it('does not filter options and returns no bundledItems even when map has children', () => {
            const child = {
                ...getPhysicalItem(),
                id: '777',
                parentId: '666',
                addedByAttributeId: 'attr-picklist',
            } as unknown as PhysicalItem;

            const parent = {
                ...getPhysicalItem(),
                id: '666',
                options: [
                    {
                        name: 'Pick List',
                        nameId: 11,
                        value: 'Item A',
                        valueId: 2,
                        attributeId: 'attr-picklist',
                    },
                ] as LineItemOption[],
            };

            const bundleItemsMap = new Map<string | number, PhysicalItem[]>([['666', [child]]]);

            const result = mapFromPhysical(parent, bundleItemsMap, false);

            expect(result.productOptions).toHaveLength(1);
            expect(result.bundledItems).toBeUndefined();
        });
    });
});
