import { PhysicalItem } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, memo } from 'react';

import { MultiShippingTableItemWithType } from './MultishippingV2Type';

export interface ConsignmentLineItemDetailProps {
    lineItems: MultiShippingTableItemWithType[] | PhysicalItem[]
}

const ConsignmentLineItemDetail: FunctionComponent<ConsignmentLineItemDetailProps> = ({
    lineItems,
}) => {
    const renderProductOptionDetails = (item: MultiShippingTableItemWithType | PhysicalItem) => {
        if (!item.options || !item.options.length) {
            return null;
        }

        return (<span className="line-item-options">{` - ${item.options.map(option => option.value).join(' / ')}`}</span>);
    }

    return (
        <ul className="consignment-line-item-list">
        {lineItems.map((item) => (
            <li key={item.id}>
                <strong>{item.quantity} x </strong>{item.name} 
                {renderProductOptionDetails(item)}
            </li>
        ))}
    </ul>
    );
};

export default memo(ConsignmentLineItemDetail);
