import { type Consignment, type PhysicalItem } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import { getAddressContent } from '../address/SingleLineStaticAddress';

import CartStockPositionsChangedItemList from './CartStockPositionsChangedItemList';

export interface CartStockPositionsChangedConsignmentGroup {
    consignment: Consignment;
    consignmentNumber: number;
    items: PhysicalItem[];
}

export interface CartStockPositionsChangedMultiConsignmentContentProps {
    consignmentGroups: CartStockPositionsChangedConsignmentGroup[];
}

const CartStockPositionsChangedMultiConsignmentContent: FunctionComponent<CartStockPositionsChangedMultiConsignmentContentProps> = ({
    consignmentGroups,
}) => (
    <div
        className="cart-stock-positions-changed-modal-groups"
        data-test="cart-stock-positions-changed-groups"
    >
        {consignmentGroups.map(({ consignment, consignmentNumber, items }) => {
            const address = getAddressContent(consignment.shippingAddress);

            return (
                <div
                    className="cart-stock-positions-changed-modal-group"
                    data-test="cart-stock-positions-changed-group"
                    key={consignment.id}
                >
                    <h3
                        className="cart-stock-positions-changed-modal-destination"
                        data-test="cart-stock-positions-changed-destination"
                    >
                        <TranslatedString
                            data={{ address, consignmentNumber }}
                            id="cart.cart_stock_modal_destination"
                        />
                    </h3>
                    <CartStockPositionsChangedItemList items={items} />
                </div>
            );
        })}
    </div>
);

export default CartStockPositionsChangedMultiConsignmentContent;
