import { type DigitalItem, type LineItemMap, type PhysicalItem } from '@bigcommerce/checkout-sdk';

export function removeBundledItems(lineItems: LineItemMap): LineItemMap {
    return {
        ...lineItems,
        physicalItems: lineItems.physicalItems.filter((item) => typeof item.parentId !== 'string'),
        digitalItems: lineItems.digitalItems.filter((item) => typeof item.parentId !== 'string'),
    };
}

export function removeAndBundleItemsTogether(items: LineItemMap): {
    nonBundledItems: LineItemMap;
    bundleItemsMap: Map<string | number, Array<PhysicalItem | DigitalItem>>;
} {
    const bundleItemsMap = new Map<string | number, Array<PhysicalItem | DigitalItem>>();

    const nonBundledItems = {
        ...items,
        physicalItems: items.physicalItems.filter((item) => {
            if (typeof item.parentId === 'string') {
                const key = String(item.parentId);
                const existing = bundleItemsMap.get(key);

                bundleItemsMap.set(key, existing ? [...existing, item] : [item]);

                return false;
            }

            return true;
        }),
        digitalItems: items.digitalItems.filter((item) => {
            if (typeof item.parentId === 'string') {
                const key = String(item.parentId);
                const existing = bundleItemsMap.get(key);

                bundleItemsMap.set(key, existing ? [...existing, item] : [item]);

                return false;
            }

            return true;
        }),
    };

    return {
        nonBundledItems,
        bundleItemsMap,
    };
}
