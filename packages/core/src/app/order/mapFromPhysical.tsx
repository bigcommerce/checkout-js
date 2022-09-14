import { PhysicalItem } from '@bigcommerce/checkout-sdk';

import getOrderSummaryItemImage from './getOrderSummaryItemImage';
import { OrderSummaryItemProps } from './OrderSummaryItem';

function mapFromPhysical(item: PhysicalItem): OrderSummaryItemProps {
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
    };
}

export default mapFromPhysical;
