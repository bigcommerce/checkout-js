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

        it('formats options without colon separator and does not set name/value', () => {
            const item = getPhysicalItem();
            const result = mapFromPhysical(item);

            expect(result.productOptions![0].content).toBe('n v');
            expect(result.productOptions![0].name).toBeUndefined();
            expect(result.productOptions![0].value).toBeUndefined();
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

        it('marks pick-list option as isMainBundledItem true and keeps all options', () => {
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

            expect(result.productOptions).toHaveLength(2);

            const colorOption = result.productOptions!.find((o) => o.name === 'Color:');
            const pickListOption = result.productOptions!.find((o) => o.name === 'Pick List:');

            expect(colorOption?.isMainBundledItem).toBe(false);
            expect(pickListOption?.isMainBundledItem).toBe(true);
        });

        it('attaches stockPosition to the pick-list option from the bundled child', () => {
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

            const result = mapFromPhysical(parent, bundleItemsMap, true);
            const pickListOption = result.productOptions!.find((o) => o.name === 'Pick List:');

            expect(pickListOption?.isMainBundledItem).toBe(true);
            expect(pickListOption?.stockPosition?.quantityBackordered).toBe(1);
            expect(pickListOption?.stockPosition?.quantityOnHand).toBe(4);
            expect(pickListOption?.stockPosition?.backorderMessage).toBe('Available soon');
        });

        it('preserves options without attributeId as isMainBundledItem false', () => {
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
                    { name: 'Size', nameId: 10, value: 'Large', valueId: 1 },
                ] as LineItemOption[],
            };

            const bundleItemsMap = new Map<string | number, PhysicalItem[]>([['666', [child]]]);

            const result = mapFromPhysical(parent, bundleItemsMap, true);

            expect(result.productOptions).toHaveLength(1);
            expect(result.productOptions![0].isMainBundledItem).toBe(false);
        });

        it('returns no bundledItems when the item has no children', () => {
            const result = mapFromPhysical(getPhysicalItem(), new Map(), true);

            expect(result.bundledItems).toBeUndefined();
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
