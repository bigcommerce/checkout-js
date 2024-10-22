import { Consignment, LineItemOption, PhysicalItem } from "@bigcommerce/checkout-sdk";

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

export interface UnassignedItems {
    lineItems: MultiShippingTableItemWithType[];
    hasDigitalItems: boolean;
    shippableItemsCount: number;
};

export interface MappedDataConsignment extends Consignment, UnassignedItems {
    consignmentNumber: number;
}
