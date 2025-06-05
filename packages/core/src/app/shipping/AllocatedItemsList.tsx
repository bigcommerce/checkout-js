import React from "react";

import { TranslatedString } from '@bigcommerce/checkout/locale';

import { IconClose } from "../ui/icon";

import { renderItemContent } from "./ConsignmentLineItemDetail";
import { ItemSplitTooltip } from "./ItemSplitTooltip";
import { MultiShippingTableData, MultiShippingTableItemWithType } from "./MultishippingType";
import { useStyleContext } from "../checkout/useStyleContext";

interface AllocatedItemsListProps {
    assignedItems: MultiShippingTableData;
    onUnassignItem(itemToDelete: MultiShippingTableItemWithType): void;
}

const AllocatedItemsList = ({ assignedItems, onUnassignItem }: AllocatedItemsListProps) => {
    const { newFontStyle } = useStyleContext();

    return (
        <div className="allocated-line-items">
            <h3 className={newFontStyle ? 'body-bold' : ''}>
                <TranslatedString data={{ count: assignedItems.shippableItemsCount }} id="shipping.multishipping_item_allocated_message" />
                {assignedItems.hasSplitItems && (
                    <ItemSplitTooltip />
                )}
            </h3>
            <ul className="allocated-line-items-list">
                {assignedItems.lineItems.map(item => (
                    <li key={item.id}>
                        {renderItemContent(item, newFontStyle)}
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
