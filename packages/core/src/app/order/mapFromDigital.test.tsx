import { type LineItemOption, type PhysicalItem } from '@bigcommerce/checkout-sdk';

import { getDigitalItem, getPhysicalItem } from '../cart/lineItem.mock';

import mapFromDigital from './mapFromDigital';

describe('mapFromDigital()', () => {
    it('returns downloadable related properties when it has a download URL', () => {
        const { options, ...item } = getDigitalItem();
        const { productOptions = [] } = mapFromDigital(item);

        expect(productOptions[0].testId).toBe('cart-item-digital-product-download');

        expect(productOptions[0].content).toMatchSnapshot();
    });

    it('returns digital related properties when it has no download URL', () => {
        const item = {
            ...getDigitalItem(),
            options: [] as LineItemOption[],
            downloadPageUrl: '',
        };
        const { productOptions = [] } = mapFromDigital(item);

        expect(productOptions[0].testId).toBe('cart-item-digital-product');

        expect(productOptions[0].content).toMatchSnapshot();
    });

    describe('with pickListExperimentEnabled', () => {
        it('filters out options whose attributeId matches a bundled item', () => {
            const bundledChild = {
                ...getPhysicalItem(),
                id: '777',
                parentId: '667',
                addedByAttributeId: 'attr-picklist',
            } as unknown as PhysicalItem;

            const item = {
                ...getDigitalItem(),
                id: '667',
                options: [
                    {
                        name: 'Color',
                        nameId: 10,
                        value: 'Red',
                        valueId: 1,
                        attributeId: 'attr-color',
                    },
                    {
                        name: 'Pick List Option',
                        nameId: 11,
                        value: 'Item A',
                        valueId: 2,
                        attributeId: 'attr-picklist',
                    },
                ] as LineItemOption[],
            };

            const bundleItemsMap = new Map<string | number, PhysicalItem[]>([
                ['667', [bundledChild]],
            ]);

            const { productOptions = [] } = mapFromDigital(item, bundleItemsMap, true);
            const itemOptions = productOptions.filter(
                (o) => o.testId === 'cart-item-product-option',
            );

            expect(itemOptions).toHaveLength(1);
            expect(itemOptions[0].content).toBe('Color: Red');
        });

        it('returns bundledItems with backorder details from stockPosition', () => {
            const bundledChild = {
                ...getPhysicalItem(),
                id: '777',
                name: 'Bundled Product',
                parentId: '667',
                addedByAttributeId: 'attr-picklist',
                stockPosition: {
                    quantityBackordered: 2,
                    quantityOnHand: 3,
                    quantityOutOfStock: 0,
                    backorderMessage: 'Ships in 5 days',
                },
            } as unknown as PhysicalItem;

            const item = { ...getDigitalItem(), id: '667', options: [] as LineItemOption[] };

            const bundleItemsMap = new Map<string | number, PhysicalItem[]>([
                ['667', [bundledChild]],
            ]);

            const { bundledItems } = mapFromDigital(item, bundleItemsMap, true);

            expect(bundledItems).toHaveLength(1);
            expect(bundledItems![0].id).toBe('777');
            expect(bundledItems![0].name).toBe('Bundled Product');
            expect(bundledItems![0].quantityBackordered).toBe(2);
            expect(bundledItems![0].quantityOnHand).toBe(3);
            expect(bundledItems![0].backorderMessage).toBe('Ships in 5 days');
        });

        it('returns bundledItems with bundleLabel from the matching parent option', () => {
            const bundledChild = {
                ...getPhysicalItem(),
                id: '777',
                name: 'Bundled Product',
                parentId: '667',
                addedByAttributeId: 'attr-picklist',
            } as unknown as PhysicalItem;

            const item = {
                ...getDigitalItem(),
                id: '667',
                options: [
                    {
                        name: 'Pick List Option',
                        nameId: 11,
                        value: 'Item A',
                        valueId: 2,
                        attributeId: 'attr-picklist',
                    },
                ] as LineItemOption[],
            };

            const bundleItemsMap = new Map<string | number, PhysicalItem[]>([
                ['667', [bundledChild]],
            ]);

            const { bundledItems } = mapFromDigital(item, bundleItemsMap, true);

            expect(bundledItems).toHaveLength(1);
            expect(bundledItems![0].bundleLabel).toBe('Pick List Option');
        });

        it('returns undefined bundledItems when item has no children in the map', () => {
            const item = { ...getDigitalItem(), id: '667' };
            const bundleItemsMap = new Map<string | number, PhysicalItem[]>();

            const { bundledItems } = mapFromDigital(item, bundleItemsMap, true);

            expect(bundledItems).toBeUndefined();
        });
    });

    describe('without pickListExperimentEnabled', () => {
        it('does not filter options and returns no bundledItems', () => {
            const bundledChild = {
                ...getPhysicalItem(),
                id: '777',
                parentId: '667',
                addedByAttributeId: 'attr-picklist',
            } as unknown as PhysicalItem;

            const item = {
                ...getDigitalItem(),
                id: '667',
                options: [
                    {
                        name: 'Pick List Option',
                        nameId: 11,
                        value: 'Item A',
                        valueId: 2,
                        attributeId: 'attr-picklist',
                    },
                ] as LineItemOption[],
            };

            const bundleItemsMap = new Map<string | number, PhysicalItem[]>([
                ['667', [bundledChild]],
            ]);

            const { productOptions = [], bundledItems } = mapFromDigital(
                item,
                bundleItemsMap,
                false,
            );

            expect(
                productOptions.filter((o) => o.testId === 'cart-item-product-option'),
            ).toHaveLength(1);
            expect(bundledItems).toBeUndefined();
        });
    });
});
