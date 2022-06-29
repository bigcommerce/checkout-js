import { CustomItem } from '@bigcommerce/checkout-sdk';

import { OrderSummaryItemProps } from './OrderSummaryItem';

function mapFromCustom(item: CustomItem): OrderSummaryItemProps {
    return {
        id: item.id,
        quantity: item.quantity,
        amount: item.extendedListPrice,
        name: item.name,
    };
}

export default mapFromCustom;
