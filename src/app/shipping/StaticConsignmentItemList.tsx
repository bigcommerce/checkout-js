import { Cart, Consignment } from '@bigcommerce/checkout-sdk';
import React, { memo, FunctionComponent } from 'react';

import { TranslatedString } from '../locale';

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
                <TranslatedString id="cart.item_count_text"
                    data={ { count: getLineItemsCount(lineItems) } } />
            </strong>

            <ul>
                { lineItems.map(item =>
                    <li key={ item.id }>
                        { item.quantity } x { item.name }
                    </li>
                ) }
            </ul>
        </div>
    );
};

export default memo(StaticConsignmentItemList);
