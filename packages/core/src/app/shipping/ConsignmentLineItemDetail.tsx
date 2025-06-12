import { PhysicalItem } from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import React, { FunctionComponent, memo } from 'react';

import { useStyleContext } from '@bigcommerce/checkout/payment-integration-api';

import { MultiShippingTableItemWithType } from './MultishippingType';

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

export const renderItemContent = (item: MultiShippingTableItemWithType | PhysicalItem, newFontStyle = false, isMultiShippingSummary = false) => {
    return <span
        className={classNames(
            { 'body-regular': newFontStyle && !isMultiShippingSummary },
            { 'sub-text': newFontStyle && isMultiShippingSummary },)
        }>
        <span className={classNames(
            { 'body-bold': newFontStyle && !isMultiShippingSummary },
            { 'sub-text-bold': newFontStyle && isMultiShippingSummary },)
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
    const { newFontStyle } = useStyleContext();

    return (
        <ul className="consignment-line-item-list">
        {lineItems.map((item) => (
            <li key={item.id}>
                {renderItemContent(item, newFontStyle, isMultiShippingSummary)}
            </li>
        ))}
    </ul>
    );
};

export default memo(ConsignmentLineItemDetail);
