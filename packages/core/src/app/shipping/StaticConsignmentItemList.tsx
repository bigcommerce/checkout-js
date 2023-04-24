import { Cart, Consignment } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, memo } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import findLineItems from './findLineItems';
import getLineItemsCount from './getLineItemsCount';

export interface StaticConsignmentItemListProps {
    consignment: Consignment;
    cart: Cart;
}

const StaticConsignmentItemList: FunctionComponent<StaticConsignmentItemListProps> = ({
    cart,
    consignment,
}) => {
    const lineItems = findLineItems(cart, consignment);

    return (
        <div className="staticConsignment-items">
            <strong>
                <TranslatedString
                    data={{ count: getLineItemsCount(lineItems) }}
                    id="cart.item_count_text"
                />
            </strong>

            <ul>
                {lineItems.map((item) => (
                    <li key={item.id}>{`${item.quantity} x ${item.name}`}</li>
                ))}
            </ul>
        </div>
    );
};

export default memo(StaticConsignmentItemList);
