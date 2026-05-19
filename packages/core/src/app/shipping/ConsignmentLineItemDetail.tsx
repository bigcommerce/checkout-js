import { type PhysicalItem } from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import React, { type FunctionComponent, memo } from 'react';

import { useCheckout } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from '@bigcommerce/checkout/locale';

import { type MultiShippingTableItemWithType } from './MultishippingType';

export interface ConsignmentLineItemDetailProps {
    lineItems: MultiShippingTableItemWithType[] | PhysicalItem[];
    isMultiShippingSummary?: boolean;
}

const renderProductOptionDetails = (item: MultiShippingTableItemWithType | PhysicalItem) => {
    if (!item.options || !item.options.length) {
        return null;
    }

    return (
        <span className="line-item-options">{` - ${item.options.map((option) => option.value).join(' / ')}`}</span>
    );
};

export const ConsignmentLineItemContent = ({
    item,
    isMultiShippingSummary = false,
}: {
    item: MultiShippingTableItemWithType | PhysicalItem;
    isMultiShippingSummary?: boolean;
}) => {
    const { checkoutState } = useCheckout();
    const config = checkoutState.data.getConfig();
    const shouldDisplayBackorderQuantity =
        !!config?.inventorySettings?.shouldDisplayBackorderMessagesOnStorefront &&
        config?.inventorySettings?.showQuantityOnBackorder &&
        !!item.stockPosition?.quantityBackordered;

    return (
        <span
            className={classNames(
                { 'body-regular': !isMultiShippingSummary },
                { 'sub-text': isMultiShippingSummary },
            )}
        >
            <span
                className={classNames(
                    { 'body-bold': !isMultiShippingSummary },
                    { 'sub-text-bold': isMultiShippingSummary },
                )}
            >
                {`${item.quantity} x `}
            </span>
            {item.name}{' '}
            {shouldDisplayBackorderQuantity && (
                <span
                    className={classNames(
                        { 'body-thin': !isMultiShippingSummary },
                        { 'sub-text-medium': isMultiShippingSummary },
                    )}
                >
                    <TranslatedString
                        data={{ count: item.stockPosition?.quantityBackordered }}
                        id="shipping.multishipping_backordered_quantity"
                    />
                </span>
            )}
            {renderProductOptionDetails(item)}
        </span>
    );
};

const ConsignmentLineItemDetail: FunctionComponent<ConsignmentLineItemDetailProps> = ({
    lineItems,
    isMultiShippingSummary = false,
}) => {
    return (
        <ul className="consignment-line-item-list">
            {lineItems.map((item) => (
                <li key={item.id}>
                    <ConsignmentLineItemContent
                        isMultiShippingSummary={isMultiShippingSummary}
                        item={item}
                    />
                </li>
            ))}
        </ul>
    );
};

export default memo(ConsignmentLineItemDetail);
