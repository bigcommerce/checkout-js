import { type Consignment, type LineItemOption, type PhysicalItem } from "@bigcommerce/checkout-sdk";

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

export interface MultiShippingTableData {
    lineItems: MultiShippingTableItemWithType[];
    hasDigitalItems: boolean;
    hasSplitItems: boolean;
    shippableItemsCount: number;
};

export interface MultiShippingConsignmentData extends Consignment, MultiShippingTableData {
    consignmentNumber: number;
}
