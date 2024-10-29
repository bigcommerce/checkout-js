import { Consignment, LineItemMap } from "@bigcommerce/checkout-sdk";

import { useCheckout } from "@bigcommerce/checkout/payment-integration-api";

import { LineItemType, MultiShippingConsignmentData, MultiShippingTableData, MultiShippingTableItemWithType } from "../MultishippingV2Type";

interface MultiShippingConsignmentItemsHook {
    unassignedItems: MultiShippingTableData;
    consignmentList: MultiShippingConsignmentData[];
}

const calculateShippableItemsCount = (items: MultiShippingTableItemWithType[]): number => {
    return items.reduce((total, item) => total + item.quantity, 0);
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

    const consignmentList: MultiShippingConsignmentData[] = [];

    lineItems.physicalItems.forEach((item) =>
        unassignedItemsMap.set(item.id.toString(), { ...item, type: LineItemType.Physical }),
    );
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
            shippableItemsCount: calculateShippableItemsCount(consignmentLineItems),
            lineItems: consignmentLineItems,
        });
    });

    const unassignedItemsList = Array.from(unassignedItemsMap.values());

    const unassignedItems: MultiShippingTableData = {
        lineItems: unassignedItemsList,
        hasDigitalItems: digitalItemsMap.size > 0,
        shippableItemsCount: calculateShippableItemsCount(unassignedItemsList),
    };

    return { consignmentList, unassignedItems };
}

const defaultMultiShippingConsignmentItems: MultiShippingConsignmentItemsHook = {
    unassignedItems: {
        lineItems: [],
        hasDigitalItems: false,
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

    const { consignmentList, unassignedItems } =
        mapConsignmentsItems(lineItems, consignments);

    return {
        unassignedItems,
        consignmentList,
    };
};
