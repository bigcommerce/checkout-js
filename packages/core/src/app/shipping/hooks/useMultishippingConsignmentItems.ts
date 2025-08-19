import { type Consignment, type LineItemMap } from "@bigcommerce/checkout-sdk";

import { useCheckout } from "@bigcommerce/checkout/payment-integration-api";

import { LineItemType, type MultiShippingConsignmentData, type MultiShippingTableData, type MultiShippingTableItemWithType } from "../MultishippingType";
import { generateItemHash } from "../utils";

interface MultiShippingConsignmentItemsHook {
    unassignedItems: MultiShippingTableData;
    consignmentList: MultiShippingConsignmentData[];
}

// TODO: consolidate this from /app/order/removeBundledItems
function removeBundledItems(lineItems: LineItemMap): LineItemMap {
    return {
        ...lineItems,
        physicalItems: lineItems.physicalItems.filter((item) => typeof item.parentId !== 'string'),
        digitalItems: lineItems.digitalItems.filter((item) => typeof item.parentId !== 'string'),
    };
}

const calculateShippableItemsCount = (items: MultiShippingTableItemWithType[]): number => {
    return items.reduce((total, item) => total + item.quantity, 0);
};

const hasSplitItem = (
    items: MultiShippingTableItemWithType[],
    itemHashMap: Map<string, string>,
  ): boolean => {
    const processedHashes = new Set<string>();
  
    for (const item of items) {
      const hash = itemHashMap.get(item.id.toString());

      if (!hash) continue;
  
      if (processedHashes.has(hash)) {
        return true;
      }
  
      processedHashes.add(hash);
    }
  
    return false;
  };

function mapConsignmentsItems(
    lineItems: LineItemMap,
    consignments: Consignment[],
): {
        consignmentList: MultiShippingConsignmentData[];
        unassignedItems: MultiShippingTableData;
    } {
    const unassignedItemsMap = new Map<string, MultiShippingTableItemWithType>();
    const digitalItemsMap = new Map<string, MultiShippingTableItemWithType>();

    const itemHashMap = new Map<string, string>();

    const consignmentList: MultiShippingConsignmentData[] = [];

    lineItems.physicalItems.forEach((item) => {
        unassignedItemsMap.set(item.id.toString(), { ...item, type: LineItemType.Physical });
        itemHashMap.set(item.id.toString(), generateItemHash(item));
    });
    lineItems.customItems?.forEach((item) =>
        unassignedItemsMap.set(item.id, { ...item, type: LineItemType.Custom }),
    );
    lineItems.digitalItems.forEach((item) =>
        digitalItemsMap.set(item.id.toString(), { ...item, type: LineItemType.Digital }),
    );

    consignments.forEach((consignment, index) => {
        const consignmentLineItems: MultiShippingTableItemWithType[] = [];

        consignment.lineItemIds.forEach((itemId) => {
            const item = unassignedItemsMap.get(itemId);

            if (item) {
                consignmentLineItems.push(item);
                unassignedItemsMap.delete(itemId);
            }
        });

        consignmentList.push({
            ...consignment,
            consignmentNumber: index + 1,
            hasDigitalItems: false,
            hasSplitItems: hasSplitItem(consignmentLineItems, itemHashMap),
            shippableItemsCount: calculateShippableItemsCount(consignmentLineItems),
            lineItems: consignmentLineItems,
        });
    });

    const unassignedItemsList = Array.from(unassignedItemsMap.values());

    const unassignedItems: MultiShippingTableData = {
        lineItems: unassignedItemsList,
        hasDigitalItems: digitalItemsMap.size > 0,
        hasSplitItems: hasSplitItem(unassignedItemsList, itemHashMap),
        shippableItemsCount: calculateShippableItemsCount(unassignedItemsList),
    };

    return { consignmentList, unassignedItems };
}

const defaultMultiShippingConsignmentItems: MultiShippingConsignmentItemsHook = {
    unassignedItems: {
        lineItems: [],
        hasDigitalItems: false,
        hasSplitItems: false,
        shippableItemsCount: 0,
    },
    consignmentList: [],
};

export const useMultiShippingConsignmentItems = (): MultiShippingConsignmentItemsHook => {
    const { checkoutState: {
        data: { getCheckout },
    },
    } = useCheckout();

    const checkout = getCheckout();

    if (!checkout) {
        return defaultMultiShippingConsignmentItems;
    }

    const {
        cart: { lineItems },
        consignments,
    } = checkout;

    const nonBundledLineItems = removeBundledItems(lineItems);

    const { consignmentList, unassignedItems } =
        mapConsignmentsItems(nonBundledLineItems, consignments);

    return {
        unassignedItems,
        consignmentList,
    };
};
