import { type PhysicalItem } from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import React, { type FunctionComponent, memo } from 'react';

import { type MultiShippingTableItemWithType } from './MultishippingType';

export interface ConsignmentLineItemDetailProps {
    lineItems: MultiShippingTableItemWithType[] | PhysicalItem[];
    isMultiShippingSummary?: boolean;
}

const renderProductOptionDetails = (item: MultiShippingTableItemWithType | PhysicalItem) => {
    if (!item.options || !item.options.length) {
        return null;
    }

    return (<span className="line-item-options">{` - ${item.options.map(option => option.value).join(' / ')}`}</span>);
}

export const renderItemContent = (item: MultiShippingTableItemWithType | PhysicalItem, isMultiShippingSummary = false) => {
    return <span
        className={classNames(
            { 'body-regular': !isMultiShippingSummary },
            { 'sub-text': isMultiShippingSummary },)
        }>
        <span className={classNames(
            { 'body-bold': !isMultiShippingSummary },
            { 'sub-text-bold': isMultiShippingSummary },)
        }>
            {`${item.quantity} x `}
        </span>
        {item.name}
        {renderProductOptionDetails(item)}
    </span>;
};

const ConsignmentLineItemDetail: FunctionComponent<ConsignmentLineItemDetailProps> = ({
    lineItems,
    isMultiShippingSummary = false,
}) => {

    return (
        <ul className="consignment-line-item-list">
        {lineItems.map((item) => (
            <li key={item.id}>
                {renderItemContent(item, isMultiShippingSummary)}
            </li>
        ))}
    </ul>
    );
};

export default memo(ConsignmentLineItemDetail);
