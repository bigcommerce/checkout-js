import { PhysicalItem } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent, memo } from 'react';

import { MultiShippingTableItemWithType } from './MultishippingType';
import { useStyleContext } from '../checkout/useStyleContext';

export interface ConsignmentLineItemDetailProps {
    lineItems: MultiShippingTableItemWithType[] | PhysicalItem[]
}

const renderProductOptionDetails = (item: MultiShippingTableItemWithType | PhysicalItem) => {
    if (!item.options || !item.options.length) {
        return null;
    }

    return (<span className="line-item-options">{` - ${item.options.map(option => option.value).join(' / ')}`}</span>);
}

export const renderItemContent = (item: MultiShippingTableItemWithType | PhysicalItem, newFontStyle: boolean = false) => {
    return <span className={newFontStyle ? 'body-regular' : ''}>
        <span className={newFontStyle ? 'body-bold' : ''}>{item.quantity} x </span>
        {item.name}
        {renderProductOptionDetails(item)}
    </span>;
};

const ConsignmentLineItemDetail: FunctionComponent<ConsignmentLineItemDetailProps> = ({
    lineItems,
}) => {
    const { newFontStyle } = useStyleContext();

    return (
        <ul className="consignment-line-item-list">
        {lineItems.map((item) => (
            <li key={item.id}>
                {renderItemContent(item, newFontStyle)}
            </li>
        ))}
    </ul>
    );
};

export default memo(ConsignmentLineItemDetail);
