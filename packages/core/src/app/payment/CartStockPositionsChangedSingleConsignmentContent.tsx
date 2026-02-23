import { type PhysicalItem } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent } from 'react';

import CartStockPositionsChangedItem from './CartStockPositionsChangedItem';

export interface CartStockPositionsChangedSingleConsignmentContentProps {
    items: PhysicalItem[];
}

const CartStockPositionsChangedSingleConsignmentContent: FunctionComponent<CartStockPositionsChangedSingleConsignmentContentProps> = ({
    items,
}) => (
    <ul className="productList" data-test="cart-stock-positions-changed-items">
        {items.map((item) => (
            <CartStockPositionsChangedItem item={item} key={item.id} />
        ))}
    </ul>
);

export default CartStockPositionsChangedSingleConsignmentContent;
