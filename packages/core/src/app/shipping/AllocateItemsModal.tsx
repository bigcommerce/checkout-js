import { Address, ConsignmentLineItem } from "@bigcommerce/checkout-sdk";
import { FormikProps } from "formik";
import React, { FunctionComponent, useMemo } from "react";
import { number, object } from "yup";

import { preventDefault } from "@bigcommerce/checkout/dom-utils";
import { TranslatedString, withLanguage, WithLanguageProps } from "@bigcommerce/checkout/locale";
import { Alert, AlertType, ButtonVariant } from "@bigcommerce/checkout/ui";

import { getAddressContent } from "../address/SingleLineStaticAddress";
import { withFormikExtended } from "../common/form";
import { Button } from "../ui/button";
import { Form } from "../ui/form";
import { Modal, ModalHeader } from "../ui/modal";

import AllocatedItemsList from "./AllocatedItemsList";
import { ItemSplitTooltip } from "./ItemSplitTooltip";
import LeftToAllocateItemsTable from "./LeftToAllocateItemsTable";
import { LineItemType, MultiShippingTableData, MultiShippingTableItemWithType } from "./MultishippingV2Type";

export interface AllocateItemsModalFormValues {
    [key: string]: number;
}

interface AllocateItemsModalProps {
    consignmentNumber: number;
    isOpen: boolean;
    onRequestClose?(): void;
    address: Address;
    unassignedItems: MultiShippingTableData;
    assignedItems?: MultiShippingTableData;
    onAllocateItems(consignmentLineItems: ConsignmentLineItem[]): void;
    onUnassignItem?(itemToDelete: MultiShippingTableItemWithType): void;
}

const AllocateItemsModal: FunctionComponent<AllocateItemsModalProps & FormikProps<AllocateItemsModalFormValues>> = ({
    consignmentNumber,
    isOpen,
    onRequestClose,
    address,
    assignedItems,
    unassignedItems,
    setValues,
    values,
    dirty,
    submitForm,
    errors,
    onUnassignItem,
}: AllocateItemsModalProps & FormikProps<AllocateItemsModalFormValues>) => {

    const allocatedOrSelectedItemsMessage = useMemo(() => {
        const leftItemsTotal = unassignedItems.shippableItemsCount;

        if (values && dirty) {
            const selectedItems = Object.keys(values).reduce((acc, key) => {
                if (values[key] > 0) {
                    acc += values[key];
                }

                return acc;
            }, 0);

            return <TranslatedString data={{ count: `${selectedItems}/${leftItemsTotal}` }} id="shipping.multishipping_items_selected_message" />;
        }

        return <TranslatedString data={{ count: leftItemsTotal }} id="shipping.multishipping_item_to_allocate_message" />;
    }, [values]);

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

    const formErrors = useMemo(() => {
        const errorKeys = Object.keys(errors);

        return errorKeys.reduce((acc: string[], key: string) => {
            const error = errors[key];

            if (error) {
                acc.push(error);
            }

            return Array.from(new Set(acc));
        }, []);
    }, [errors]);

    const hasItemsAssigned = !!assignedItems && assignedItems.lineItems.length > 0 && !!onUnassignItem;
    const hasUnassignedItems = !!unassignedItems && unassignedItems.lineItems.length > 0;

    const modalFooter = (
        <>
            <Button onClick={onRequestClose} variant={ButtonVariant.Secondary}>Cancel</Button>
            <Button disabled={!dirty} onClick={submitForm} type="submit" variant={ButtonVariant.Primary}>{hasItemsAssigned ? 'Save' : 'Allocate'}</Button>
        </>
    );

    return (
        <Modal
            additionalModalClassName="allocate-items-modal"
            footer={modalFooter}
            header={
                <ModalHeader>
                    <TranslatedString data={{ consignmentNumber }} id="shipping.multishipping_consignment_index_heading" />
                </ModalHeader>
            }
            isOpen={isOpen}
            onRequestClose={onRequestClose}
        >
                        
            <Form>
                <h4>{getAddressContent(address)}</h4>
                {formErrors.length > 0 && (
                    <div className="form-errors">
                        {formErrors.map((error, index) => (
                            <Alert key={index} type={AlertType.Error}>{error}</Alert>
                        ))}
                    </div>
                )}
                {unassignedItems.hasDigitalItems && (
                            <Alert type={AlertType.Info}>
                                <TranslatedString id="shipping.multishipping_digital_item_no_shipping_banner" />
                                </Alert>
                )}
                {hasItemsAssigned && (
                    <AllocatedItemsList assignedItems={assignedItems} onUnassignItem={onUnassignItem} />
                )}
                {hasUnassignedItems
                    ? <>
                        <div className="left-to-allocate-items-table-actions">
                            <p>
                                {allocatedOrSelectedItemsMessage}
                                {unassignedItems.hasSplitItems && (
                                    <ItemSplitTooltip />
                                )}
                            </p>

                            <div className="button-group">
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
                        <LeftToAllocateItemsTable
                            formErrors={errors}
                            items={unassignedItems.lineItems}
                        />
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
        validationSchema: ({ language, unassignedItems }: AllocateItemsModalProps & WithLanguageProps) => {
            const createItemSchema = (item: MultiShippingTableItemWithType) => {
                const baseSchema = number()
                    .required(language.translate('shipping.quantity_required_error'))
                    .integer(language.translate('shipping.quantity_invalid_error'))
                    .min(0, language.translate('shipping.quantity_min_error'))
                    .max(item.quantity, language.translate('shipping.quantity_max_error'))

                if (item.type === LineItemType.Custom) {
                    return baseSchema
                        .oneOf([0, item.quantity], language.translate('shipping.custom_item_quantity_error'))
                }

                return baseSchema;
            };

            const schemaObject = Object.fromEntries(
                unassignedItems.lineItems.map((item) => [item.id.toString(), createItemSchema(item)]),
            );

            return object().shape(schemaObject);
        },
        validateOnBlur: true,
        validateOnChange: false,
    })(AllocateItemsModal),
);
