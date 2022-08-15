import { Consignment, PhysicalItem } from '@bigcommerce/checkout-sdk';

export default interface ShippableItem extends PhysicalItem {
    consignment?: Consignment;
    key: string;
}
