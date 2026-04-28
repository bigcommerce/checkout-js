import { type PhysicalItem } from '@bigcommerce/checkout-sdk';

import getOrderSummaryItemImage from './getOrderSummaryItemImage';
import { mapBackorderDetails } from './mapBackorderDetails';
import { type OrderItemType } from './OrderSummaryItem';

function mapFromPhysical(item: PhysicalItem): OrderItemType {
    return {
        id: item.id,
        quantity: item.quantity,
        amount: item.extendedComparisonPrice,
        amountAfterDiscount: item.extendedSalePrice,
        name: item.name,
        image: getOrderSummaryItemImage(item),
        description: item.giftWrapping ? item.giftWrapping.name : undefined,
        productOptions: (item.options || []).map((option) => ({
            testId: 'cart-item-product-option',
            content: `${option.name} ${option.value}`,
        })),
        ...mapBackorderDetails(item),
    };
}

export default mapFromPhysical;
