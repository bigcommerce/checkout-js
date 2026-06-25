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
        it('marks pick-list option as isMainBundledItem true with stockPosition', () => {
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

            expect(itemOptions).toHaveLength(2);

            const pickListOption = itemOptions.find((o) => o.name === 'Pick List Option:');
            const colorOption = itemOptions.find((o) => o.name === 'Color:');

            expect(pickListOption?.isMainBundledItem).toBe(true);
            expect(pickListOption?.stockPosition?.quantityBackordered).toBe(2);
            expect(pickListOption?.stockPosition?.quantityOnHand).toBe(3);
            expect(pickListOption?.stockPosition?.backorderMessage).toBe('Ships in 5 days');

            expect(colorOption?.isMainBundledItem).toBe(false);
            expect(colorOption?.stockPosition).toBeUndefined();
        });

        it('preserves options without attributeId when experiment is enabled', () => {
            const item = {
                ...getDigitalItem(),
                id: '667',
                options: [
                    { name: 'Size', nameId: 10, value: 'Large', valueId: 1 },
                ] as LineItemOption[],
            };

            const bundleItemsMap = new Map<string | number, PhysicalItem[]>();

            const { productOptions = [] } = mapFromDigital(item, bundleItemsMap, true);
            const itemOptions = productOptions.filter(
                (o) => o.testId === 'cart-item-product-option',
            );

            expect(itemOptions).toHaveLength(1);
            expect(itemOptions[0].isMainBundledItem).toBe(false);
        });

        it('does not return bundledItems', () => {
            const bundledChild = {
                ...getPhysicalItem(),
                id: '777',
                parentId: '667',
                addedByAttributeId: 'attr-picklist',
            } as unknown as PhysicalItem;

            const item = { ...getDigitalItem(), id: '667', options: [] as LineItemOption[] };

            const bundleItemsMap = new Map<string | number, PhysicalItem[]>([
                ['667', [bundledChild]],
            ]);

            const { bundledItems } = mapFromDigital(item, bundleItemsMap, true);

            expect(bundledItems).toBeUndefined();
        });
    });

    describe('without pickListExperimentEnabled', () => {
        it('maps all options without colon separator and does not set name/value', () => {
            const item = {
                ...getDigitalItem(),
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

            const { productOptions = [] } = mapFromDigital(item, undefined, false);
            const itemOption = productOptions.find((o) => o.testId === 'cart-item-product-option');

            expect(itemOption?.content).toBe('Pick List Option Item A');
            expect(itemOption?.name).toBeUndefined();
            expect(itemOption?.value).toBeUndefined();
        });

        it('returns no bundledItems even when map has children', () => {
            const bundledChild = {
                ...getPhysicalItem(),
                id: '777',
                parentId: '667',
                addedByAttributeId: 'attr-picklist',
            } as unknown as PhysicalItem;

            const item = { ...getDigitalItem(), id: '667', options: [] as LineItemOption[] };

            const bundleItemsMap = new Map<string | number, PhysicalItem[]>([
                ['667', [bundledChild]],
            ]);

            const { bundledItems } = mapFromDigital(item, bundleItemsMap, false);

            expect(bundledItems).toBeUndefined();
        });
    });
});
