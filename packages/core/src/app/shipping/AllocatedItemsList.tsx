import React from "react";

import { IconClose } from "../ui/icon";

import { renderItemContent } from "./ConsignmentLineItemDetail";
import { ItemSplitTooltip } from "./ItemSplitTooltip";
import { MultiShippingTableData, MultiShippingTableItemWithType } from "./MultishippingV2Type";

interface AllocatedItemsListProps {
    assignedItems: MultiShippingTableData;
    onUnassignItem(itemToDelete: MultiShippingTableItemWithType): void;
}

const AllocatedItemsList = ({ assignedItems, onUnassignItem }: AllocatedItemsListProps) => {
    return (
        <div className="allocated-line-items">
            <h3>
                {assignedItems.shippableItemsCount > 1 ? `${assignedItems.shippableItemsCount} items` : `${assignedItems.shippableItemsCount} item`} allocated 
                {assignedItems.hasSplitItems && (
                    <ItemSplitTooltip />
                )}
            </h3>
            <ul className="allocated-line-items-list">
                {assignedItems.lineItems.map(item => (
                    <li key={item.id}>
                        {renderItemContent(item)}
                        <span data-test={`remove-${item.id.toString()}-button`} onClick={() => onUnassignItem(item)}>
                            <IconClose />
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default AllocatedItemsList;
