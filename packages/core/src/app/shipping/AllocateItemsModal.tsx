import { Address, ConsignmentLineItem } from "@bigcommerce/checkout-sdk";
import { FormikProps } from "formik";
import React, { FunctionComponent } from "react";

import { preventDefault } from "@bigcommerce/checkout/dom-utils";
import { TranslatedString, withLanguage, WithLanguageProps } from "@bigcommerce/checkout/locale";
import { ButtonVariant } from "@bigcommerce/checkout/ui";

import { getAddressContent } from "../address/SingleLineStaticAddress";
import { withFormikExtended } from "../common/form";
import { Button } from "../ui/button";
import { Form } from "../ui/form";
import { Modal, ModalHeader } from "../ui/modal";

import LeftToAllocateItemsTable from "./LeftToAllocateItemsTable";
import { MultiShippingTableData } from "./MultishippingV2Type";

export interface AllocateItemsModalFormValues {
    [key: string]: number;
}

interface AllocateItemsModalProps {
    consignmentNumber: number;
    isOpen: boolean;
    onRequestClose?(): void;
    address: Address;
    unassignedItems: MultiShippingTableData;
    onAllocateItems(consignmentLineItems: ConsignmentLineItem[]): void;
}

const AllocateItemsModal: FunctionComponent<AllocateItemsModalProps & FormikProps<AllocateItemsModalFormValues>> = ({
    consignmentNumber,
    isOpen,
    onRequestClose,
    address,
    unassignedItems,
    setValues,
    dirty,
    submitForm,
}: AllocateItemsModalProps & FormikProps<AllocateItemsModalFormValues>) => {

    const leftItemsTotal = unassignedItems.shippableItemsCount;

    const allocationPendingMessage = <TranslatedString data={{ count: leftItemsTotal }} id="shipping.multishipping_item_to_allocate_message" />;

    const handleSelectAll = () => {
        const values: AllocateItemsModalFormValues = {};

        unassignedItems.lineItems.forEach(item => {
            values[item.id.toString()] = item.quantity;
        });
        setValues(values);
    };

    const handleClearAll = () => {
        const values: AllocateItemsModalFormValues = {};

        unassignedItems.lineItems.forEach(item => {
            values[item.id.toString()] = 0;
        });
        setValues(values);
    }

    const modalFooter = (
        <>
            <Button disabled={!dirty} onClick={submitForm} type="submit" variant={ButtonVariant.Primary}>Allocate</Button>
            <Button onClick={onRequestClose} variant={ButtonVariant.Secondary}>Cancel</Button>
        </>
    );

    return (
        <Modal
            additionalModalClassName="allocate-items-modal"
            footer={modalFooter}
            header={
                <ModalHeader>
                    Destination #{consignmentNumber}
                </ModalHeader>
            }
            isOpen={isOpen}
            onRequestClose={onRequestClose}
        >
            <Form>
                <h3>{getAddressContent(address)}</h3>
                {unassignedItems.lineItems.length
                    ? <>
                        <div className="left-to-allocate-items-table-actions">
                            <p>{allocationPendingMessage}</p>
                            <div>
                                <a
                                    data-test="clear-all-items-button"
                                    href="#"
                                    onClick={preventDefault(handleClearAll)}
                                >
                                    Clear all
                                </a>
                                <a
                                    data-test="allocate-all-items-button"
                                    href="#"
                                    onClick={preventDefault(handleSelectAll)}
                                >
                                    Select all items left
                                </a>
                            </div>
                        </div>
                        <LeftToAllocateItemsTable items={unassignedItems.lineItems} />
                    </>
                    : null
                }
            </Form>
        </Modal>
    )
}

export default withLanguage(
    withFormikExtended<AllocateItemsModalProps & WithLanguageProps, AllocateItemsModalFormValues>({
        handleSubmit: (values, { props: { onAllocateItems } }) => {
            const consignmentLineItems = Object.keys(values).filter(key => values[key] > 0).map((lineItemId: string) => ({
                itemId: lineItemId,
                quantity: values[lineItemId],
            }));

            onAllocateItems(consignmentLineItems);
        },
        mapPropsToValues: ({ unassignedItems }) => {
            const values: AllocateItemsModalFormValues = {};

            unassignedItems.lineItems.forEach(item => {
                values[item.id.toString()] = 0;
            });

            return values;
        },
        enableReinitialize: true,
    })(AllocateItemsModal),
);
