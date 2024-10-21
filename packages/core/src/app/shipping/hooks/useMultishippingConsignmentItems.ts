import { Consignment, LineItemMap, LineItemOption, PhysicalItem } from "@bigcommerce/checkout-sdk";

import { useCheckout } from "@bigcommerce/checkout/payment-integration-api";

export enum LineItemType {
    Physical,
    Digital,
    GiftCertificate,
    Custom,
}

export interface MultiShippingTableItem {
    name: string;
    options?: LineItemOption[];
    giftWrapping?: PhysicalItem['giftWrapping'];
    sku: string;
    quantity: number;
    id: string | number;
    imageUrl?: string;
}

export interface MultiShippingTableItemWithType extends MultiShippingTableItem {
    type: LineItemType;
}

export interface ConsignmentItem {
    lineItems: MultiShippingTableItemWithType[];
    hasDigitalItems: boolean;
    shippableItemsCount: number;
}

export type UnassignedItems = ConsignmentItem;

export interface MappedDataConsignment extends Consignment, ConsignmentItem {
    consignmentNumber: number;
}


interface MultiShippingConsignmentItemsHook {
    getMappedDataConsignmentById: (consignmentId: string) => MappedDataConsignment | undefined;
    unassignedItems: UnassignedItems;
    mappedDataConsignmentsList: MappedDataConsignment[];
}

const calculateShippableItemsCount = (items: MultiShippingTableItemWithType[]): number => {
    return items.reduce((total, item) => total + item.quantity, 0);
};

function mapConsignmentsItems(
    lineItems: LineItemMap,
    consignments: Consignment[],
): {
    mappedDataConsignmentsList: MappedDataConsignment[];
    assignedItems: MultiShippingTableItemWithType[];
    unassignedItems: UnassignedItems;
    digitalItems: MultiShippingTableItemWithType[];
} {
    const assignedItemsMap = new Map<string, MultiShippingTableItemWithType>();
    const unassignedItemsMap = new Map<string, MultiShippingTableItemWithType>();
    const digitalItemsMap = new Map<string, MultiShippingTableItemWithType>();

    const mappedDataConsignmentsList: MappedDataConsignment[] = [];

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
                assignedItemsMap.set(itemId, item);
                consignmentLineItems.push(item);
                unassignedItemsMap.delete(itemId);
            }
        });

        mappedDataConsignmentsList.push({
            ...consignment,
            consignmentNumber: index + 1,
            hasDigitalItems: false,
            shippableItemsCount: calculateShippableItemsCount(consignmentLineItems),
            lineItems: consignmentLineItems,
        });
    });

    const unassignedItemsList = Array.from(unassignedItemsMap.values());

    const unassignedItems: UnassignedItems = {
        lineItems: unassignedItemsList,
        hasDigitalItems: digitalItemsMap.size > 0,
        shippableItemsCount: calculateShippableItemsCount(unassignedItemsList),
    };

    const digitalItems = Array.from(digitalItemsMap.values());
    const assignedItems = Array.from(assignedItemsMap.values());

    return { mappedDataConsignmentsList, assignedItems, unassignedItems, digitalItems };
}

const defaultMultiShippingConsignmentItems: MultiShippingConsignmentItemsHook = {
    getMappedDataConsignmentById: () => undefined,
    unassignedItems: {
        lineItems: [],
        hasDigitalItems: false,
        shippableItemsCount: 0,
    },
    mappedDataConsignmentsList: [],
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

    const { digitalItems, mappedDataConsignmentsList, unassignedItems } =
        mapConsignmentsItems(lineItems, consignments);

    const getMappedDataConsignmentById = (
        consignmentId: string,
    ): MappedDataConsignment | undefined => {
        return mappedDataConsignmentsList.find((consignment) => consignment.id === consignmentId);
    };

    const unassignedItemsResult: UnassignedItems = {
        ...unassignedItems,
        lineItems: [
            ...unassignedItems.lineItems,
            ...digitalItems,
        ],
    };

    return {
        getMappedDataConsignmentById,
        unassignedItems: unassignedItemsResult,
        mappedDataConsignmentsList,
    };
};
