import { ConsignmentLineItem } from "@bigcommerce/checkout-sdk";
import React, { FunctionComponent, useState } from "react";

import { preventDefault } from "@bigcommerce/checkout/dom-utils";
import { useCheckout } from "@bigcommerce/checkout/payment-integration-api";

import { IconChevronDown, IconChevronUp } from "../ui/icon";

import AllocateItemsModal from "./AllocateItemsModal";
import ConsignmentLineItemDetail from "./ConsignmentLineItemDetail";
import { AssignItemFailedError, UnassignItemError } from "./errors";
import { useDeallocateItem } from "./hooks/useDeallocateItem";
import { useMultiShippingConsignmentItems } from "./hooks/useMultishippingConsignmentItems";
import { MultiShippingConsignmentData, MultiShippingTableItemWithType } from "./MultishippingV2Type";

interface ConsignmentLineItemProps {
    consignmentNumber: number;
    consignment: MultiShippingConsignmentData;
    onUnhandledError(error: Error): void;
}

const ConsignmentLineItem: FunctionComponent<ConsignmentLineItemProps> = ({ consignmentNumber, consignment, onUnhandledError }: ConsignmentLineItemProps) => {
    const [isOpenAllocateItemsModal, setIsOpenAllocateItemsModal] = useState(false);
    const [showItems, setShowItems] = useState(true);

    const { unassignedItems } = useMultiShippingConsignmentItems();
    const { checkoutService: { assignItemsToAddress: assignItem } } = useCheckout();
    const deleteItem = useDeallocateItem();

    const toggleAllocateItemsModal = () => {
        setIsOpenAllocateItemsModal(!isOpenAllocateItemsModal);
    }

    const handleAssignItems = async (consignmentLineItems: ConsignmentLineItem[]) => {
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

    const handleUnassignItems = async (itemToDelete: MultiShippingTableItemWithType) => {
        try {
            const consignmentRequest = {
                address: consignment.address,
                shippingAddress: consignment.shippingAddress,
                lineItems: [
                    {
                        quantity: itemToDelete.quantity,
                        itemId: itemToDelete.id,
                    },
                ],
            }

            await deleteItem(consignmentRequest, itemToDelete.id.toString(), consignment);
        } catch (error) {
            if (error instanceof Error) {
                onUnhandledError(new UnassignItemError(error));
            }
        }
    }

    const toggleShowItems = () => {
        setShowItems(!showItems);
    }

    const itemsCount = consignment.shippableItemsCount;

    return (
        <div>
            <AllocateItemsModal
                address={consignment.shippingAddress}
                assignedItems={consignment}
                consignmentNumber={consignmentNumber}
                isOpen={isOpenAllocateItemsModal}
                onAllocateItems={handleAssignItems}
                onRequestClose={toggleAllocateItemsModal}
                onUnassignItem={handleUnassignItems}
                unassignedItems={unassignedItems}
            />
            <div className="consignment-line-item-header">
                <div>
                    <h3>{itemsCount > 1 ? `${itemsCount} items` : `${itemsCount} item`} allocated</h3>
                    <a
                        className="expand-items-button"
                        data-test="expand-items-button"
                        href="#"
                        onClick={preventDefault(toggleShowItems)}
                    >
                        {showItems ? (
                            <>
                                Hide items
                                <IconChevronUp />
                            </>
                        ) : (
                            <>
                                Show items
                                <IconChevronDown />
                            </>
                        )}
                    </a>
                </div>
                <a
                    data-test="reallocate-items-button"
                    href="#"
                    onClick={preventDefault(toggleAllocateItemsModal)}
                >
                    Reallocate items
                </a>
            </div>
            {showItems
                ? <ConsignmentLineItemDetail lineItems={consignment.lineItems} />
                : null
            }       
        </div>
    )
}

export default ConsignmentLineItem;
