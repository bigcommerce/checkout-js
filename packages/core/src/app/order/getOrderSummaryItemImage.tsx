import { DigitalItem, PhysicalItem } from '@bigcommerce/checkout-sdk';
import React, { ReactNode } from 'react';

export default function getOrderSummaryItemImage(item: DigitalItem | PhysicalItem): ReactNode {
    if (!item.imageUrl) {
        return;
    }

    return <img alt="" data-test="cart-item-image" src={item.imageUrl} />;
}
