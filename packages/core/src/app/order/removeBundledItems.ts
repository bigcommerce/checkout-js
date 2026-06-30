import { type DigitalItem, type LineItemMap, type PhysicalItem } from '@bigcommerce/checkout-sdk';

export function buildBundleItemsMapFromOrder(
    lineItems: LineItemMap,
    orderBundledItems: Pick<LineItemMap, 'physicalItems' | 'digitalItems'>,
): {
    nonBundledItems: LineItemMap;
    bundleItemsMap: Map<string | number, Array<PhysicalItem | DigitalItem>>;
} {
    const attributeItemMap = new Map<string, PhysicalItem | DigitalItem>();
    const bundledItemIds = new Set<string>();

    [...orderBundledItems.physicalItems, ...orderBundledItems.digitalItems].forEach((item) => {
        if (item.addedByAttributeId) {
            attributeItemMap.set(item.addedByAttributeId, item);
        }

        bundledItemIds.add(String(item.id));
    });

    const bundleItemsMap = new Map<string | number, Array<PhysicalItem | DigitalItem>>();

    [...lineItems.physicalItems, ...lineItems.digitalItems].forEach((item) => {
        if (item.options && item.options.length === 0) {
            return [];
        }

        const children = (item.options ?? []).flatMap((option) => {
            if (!option.attributeId) {
                return [];
            }

            const bundledItem = attributeItemMap.get(option.attributeId);

            return bundledItem ? [bundledItem] : [];
        });

        if (children.length > 0) {
            bundleItemsMap.set(String(item.id), children);
        }
    });

    return {
        nonBundledItems: {
            ...lineItems,
            physicalItems: lineItems.physicalItems.filter(
                (item) => !bundledItemIds.has(String(item.id)),
            ),
            digitalItems: lineItems.digitalItems.filter(
                (item) => !bundledItemIds.has(String(item.id)),
            ),
        },
        bundleItemsMap,
    };
}

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
