import { PhysicalItem } from '@bigcommerce/checkout-sdk';
import React from 'react';

import { ShopperCurrency } from '../currency';

import getOrderSummaryItemImage from './getOrderSummaryItemImage';
import { OrderSummaryItemProps } from './OrderSummaryItem';

function mapFromPhysical(item: PhysicalItem): OrderSummaryItemProps {
    let description;

    if (item.giftWrapping) {
        description = (
            <>
                { item.giftWrapping.name }
                { ' (' }
                <ShopperCurrency amount={ item.giftWrapping.amount } />
                { ')' }
            </>
        );
    }

    return {
        id: item.id,
        quantity: item.quantity,
        amount: item.extendedComparisonPrice,
        amountAfterDiscount: item.extendedSalePrice,
        name: item.name,
        image: getOrderSummaryItemImage(item),
        description,
        productOptions: (item.options || []).map(option => ({
            testId: 'cart-item-product-option',
            content: `${option.name} ${option.value}`,
        })),
    };
}

export default mapFromPhysical;
