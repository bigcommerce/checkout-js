import { PhysicalItem } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, memo } from 'react';

import { MultiShippingTableItemWithType } from './MultishippingType';

export interface ConsignmentLineItemDetailProps {
    lineItems: MultiShippingTableItemWithType[] | PhysicalItem[]
}

const renderProductOptionDetails = (item: MultiShippingTableItemWithType | PhysicalItem) => {
    if (!item.options || !item.options.length) {
        return null;
    }

    return (<span className="line-item-options">{` - ${item.options.map(option => option.value).join(' / ')}`}</span>);
}

export const renderItemContent = (item: MultiShippingTableItemWithType | PhysicalItem) => {
    return <span>
        <strong>{item.quantity} x </strong>{item.name}
        {renderProductOptionDetails(item)}
    </span>;
};

const ConsignmentLineItemDetail: FunctionComponent<ConsignmentLineItemDetailProps> = ({
    lineItems,
}) => {

    return (
        <ul className="consignment-line-item-list">
        {lineItems.map((item) => (
            <li key={item.id}>
                {renderItemContent(item)}
            </li>
        ))}
    </ul>
    );
};

export default memo(ConsignmentLineItemDetail);
