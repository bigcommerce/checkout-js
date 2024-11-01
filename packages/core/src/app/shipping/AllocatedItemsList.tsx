import React from "react";

import { IconClose } from "../ui/icon";

import { MultiShippingTableData, MultiShippingTableItemWithType } from "./MultishippingV2Type";

export const getItemContent = (lineItem: MultiShippingTableItemWithType) => {
    return <span>
        <strong>{`${lineItem.quantity} x `}</strong>
        {lineItem.name}
        {lineItem.options?.length
            ? <span className="line-item-options">{` - ${lineItem.options.map(option => option.value).join('/ ')}`}</span>
            : ''}
    </span>;
};

const AllocatedItemsList = ({ assignedItems, onUnassignItem }: { assignedItems: MultiShippingTableData, onUnassignItem(itemToDelete: MultiShippingTableItemWithType): Promise<void> }) => {
    return (
        <div className="allocated-line-items">
            <h3>{assignedItems.shippableItemsCount > 1 ? `${assignedItems.shippableItemsCount} items` : `${assignedItems.shippableItemsCount} item`} allocated</h3>
            <ul className="allocated-line-items-list">
                {assignedItems.lineItems.map(item => (
                    <li key={item.id}>
                        {getItemContent(item)}
                        <span onClick={() => onUnassignItem(item)}>
                            <IconClose />
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default AllocatedItemsList;