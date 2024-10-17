import { ConsignmentLineItem } from "@bigcommerce/checkout-sdk";
import React, { FunctionComponent, useState } from "react";

import { preventDefault } from "@bigcommerce/checkout/dom-utils";
import { useCheckout } from "@bigcommerce/checkout/payment-integration-api";

import AllocateItemsModal from "./AllocateItemsModal";
import { AssignItemFailedError } from "./errors";
import { MappedDataConsignment, useMultiShippingConsignmentItems } from "./hooks/useMultishippingConsignmentItems";

interface ConsignmentLineItemProps {
    consignmentNumber: number;
    consignment: MappedDataConsignment;
    onUnhandledError(error: Error): void;
}

const ConsignmentLineItem: FunctionComponent<ConsignmentLineItemProps> = ({ consignmentNumber, consignment, onUnhandledError }: ConsignmentLineItemProps) => {
    const [isOpenAllocateItemsModal, setIsOpenAllocateItemsModal] = useState(false);
    const { unassignedItems } = useMultiShippingConsignmentItems();

    const { checkoutService: { assignItemsToAddress: assignItem } } = useCheckout();

    const filteredLineItems = unassignedItems.lineItems.filter(
        (item) => !consignment.lineItemIds.includes(item.id.toString()),
    );
    const filteredUnassignedItems = {
        ...unassignedItems,
        lineItems: filteredLineItems
    };

    const toggleAllocateItemsModal = () => {
        setIsOpenAllocateItemsModal(!isOpenAllocateItemsModal);
    }

    const handleAllocateItems = async (consignmentLineItems: ConsignmentLineItem[]) => {
        try {
            await assignItem({
                address: consignment.address,
                lineItems: consignmentLineItems,
            });

        } catch (error) {
            if (error instanceof Error) {
                onUnhandledError(new AssignItemFailedError(error));
            }
        } finally {
            toggleAllocateItemsModal();
        }
    }

    return (
        <div>
            <AllocateItemsModal
                address={consignment.shippingAddress}
                consignmentNumber={consignmentNumber}
                isOpen={isOpenAllocateItemsModal}
                onAllocateItems={handleAllocateItems}
                onRequestClose={toggleAllocateItemsModal}
                unassignedItems={filteredUnassignedItems}
            />
            <div className="consignment-line-item-header">
                <h3>Items</h3>
                <a
                    data-test="reallocate-items-button"
                    href="#"
                    onClick={preventDefault(toggleAllocateItemsModal)}
                >
                    Reallocate items
                </a>
            </div>
            <ul className="consignment-line-item-list">
                {consignment.lineItems.map(lineItem => (
                    <li key={lineItem.id}>
                        {`${lineItem.quantity} x ${lineItem.name} ${lineItem.options?.length ? `- ${lineItem.options.map(option => option.value).join('/ ')}` : ''}`}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default ConsignmentLineItem;
