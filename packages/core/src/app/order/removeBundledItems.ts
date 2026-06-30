import { type DigitalItem, type LineItemMap, type PhysicalItem } from '@bigcommerce/checkout-sdk';

export function buildBundleItemsMapFromOrder(
    lineItems: LineItemMap,
    orderBundledItems: Pick<LineItemMap, 'physicalItems' | 'digitalItems'>,
): {
    nonBundledItems: LineItemMap;
    bundleItemsMap: Map<string | number, Array<PhysicalItem | DigitalItem>>;
} {
    const attrToChild = new Map<string, PhysicalItem | DigitalItem>();

    for (const child of [...orderBundledItems.physicalItems, ...orderBundledItems.digitalItems]) {
        if (child.addedByAttributeId) {
            attrToChild.set(child.addedByAttributeId, child);
        }
    }

    const bundledIds = new Set([
        ...orderBundledItems.physicalItems.map((item) => String(item.id)),
        ...orderBundledItems.digitalItems.map((item) => String(item.id)),
    ]);

    const bundleItemsMap = new Map<string | number, Array<PhysicalItem | DigitalItem>>();

    for (const parent of [...lineItems.physicalItems, ...lineItems.digitalItems]) {
        const children = (parent.options ?? []).flatMap((opt) => {
            if (!opt.attributeId) return [];

            const child = attrToChild.get(opt.attributeId);

            return child ? [child] : [];
        });

        if (children.length > 0) {
            bundleItemsMap.set(String(parent.id), children);
        }
    }

    return {
        nonBundledItems: {
            ...lineItems,
            physicalItems: lineItems.physicalItems.filter(
                (item) => !bundledIds.has(String(item.id)),
            ),
            digitalItems: lineItems.digitalItems.filter((item) => !bundledIds.has(String(item.id))),
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
