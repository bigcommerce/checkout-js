import { type DigitalItem, type PhysicalItem } from '@bigcommerce/checkout-sdk';

import { type OrderItemType } from './OrderSummaryItem';

export const mapBackorderDetails = (item: DigitalItem | PhysicalItem): Pick<OrderItemType, 'quantityBackordered' | 'quantityOnHand' | 'backorderMessage'> => {
    const quantityBackordered = item.stockPosition?.quantityBackordered ?? item.quantityBackordered;
    const quantityOnHand = item.stockPosition?.quantityOnHand ?? ((quantityBackordered != null ? (item.quantity - quantityBackordered) : undefined));
    const backorderMessage = item.stockPosition?.backorderMessage || item.backorderMessage || undefined;

    return {
        quantityBackordered,
        quantityOnHand,
        backorderMessage,
    };
}
