import { Address, ConsignmentLineItem } from "@bigcommerce/checkout-sdk";
import { FormikProps } from "formik";
import React, { FunctionComponent } from "react";
import { number, object } from "yup";

import { preventDefault } from "@bigcommerce/checkout/dom-utils";
import { withLanguage, WithLanguageProps } from "@bigcommerce/checkout/locale";
import { ButtonVariant } from "@bigcommerce/checkout/ui";

import { getAddressContent } from "../address/SingleLineStaticAddress";
import { withFormikExtended } from "../common/form";
import { Button } from "../ui/button";
import { Form } from "../ui/form";
import { Modal, ModalHeader } from "../ui/modal";


import { MultiShippingTableItemWithType, UnassignedItems } from "./hooks/useMultishippingConsignmentItems";
import LeftToAllocateItemsTable from "./LeftToAllocateItemsTable";





export interface AllocateItemsModalFormValues {
    [key: string]: number;
}

interface AllocateItemsModalProps {
    consignmentNumber: number;
    isOpen: boolean;
    onRequestClose?(): void;
    address: Address;
    unassignedItems: UnassignedItems;
    onAllocateItems(consignmentLineItems: ConsignmentLineItem[]): void;
}

const AllocateItemsModal: FunctionComponent<AllocateItemsModalProps & FormikProps<AllocateItemsModalFormValues>> = ({
    consignmentNumber,
    isOpen,
    onRequestClose,
    address,
    unassignedItems,
    setValues,
}: AllocateItemsModalProps & FormikProps<AllocateItemsModalFormValues>) => {

    const leftItemsTotal = unassignedItems.shippableItemsCount;

    const allocationPendingMessage = `${leftItemsTotal} ${leftItemsTotal === 1 ? 'item left to allocate' : 'items left to allocate'
        }`;

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

    return (
        <Modal
            additionalModalClassName="allocate-items-modal"
            header={
                <ModalHeader>
                    Allocate items to destination {consignmentNumber}
                </ModalHeader>
            }
            isOpen={isOpen}
            onRequestClose={onRequestClose}
        >
            <Form>
                <h3>{getAddressContent(address)}</h3>
                <div className="left-to-allocate-items-table-actions">
                    <p>{allocationPendingMessage}</p>
                    <a
                        data-test="clear-all-items-button"
                        href="#"
                        onClick={preventDefault(handleClearAll)}
                    >
                        Clear All
                    </a>
                    <a
                        data-test="allocate-all-items-button"
                        href="#"
                        onClick={preventDefault(handleSelectAll)}
                    >
                        Select All
                    </a>
                </div>
                <LeftToAllocateItemsTable items={unassignedItems} />
                <div className="form-actions">
                    <Button type="submit" variant={ButtonVariant.Primary}>Allocate</Button>
                    <Button onClick={onRequestClose} variant={ButtonVariant.Secondary}>Cancel</Button>
                </div>
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
        validationSchema: ({ unassignedItems }: AllocateItemsModalProps) => {
            const createItemSchema = (item: MultiShippingTableItemWithType) => {
                return number()
                    .integer()
                    .min(0)
                    .max(item.quantity, `You can't allocate more than ${item.quantity} items`)
            };
            const schemaObject = Object.fromEntries(
                unassignedItems.lineItems.map((item) => [item.id.toString(), createItemSchema(item)]),
            );

            return object().shape(schemaObject);
        }
    })(AllocateItemsModal),
);