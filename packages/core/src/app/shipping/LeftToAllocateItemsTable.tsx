import { FormikErrors } from "formik";
import React, { FunctionComponent } from "react";

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { useStyleContext } from '@bigcommerce/checkout/payment-integration-api';

import { isMobileView as isMobileViewUI } from "../ui/responsive";

import { AllocateItemsModalFormValues } from "./AllocateItemsModal";
import LeftToAllocateItem from "./LeftToAllocateItem";
import { MultiShippingTableItemWithType } from "./MultishippingType";

interface LeftToAllocateItemsTableProps {
    items: MultiShippingTableItemWithType[];
    formErrors: FormikErrors<AllocateItemsModalFormValues>;
}

const LeftToAllocateItemsTable: FunctionComponent<LeftToAllocateItemsTableProps> = ({ items, formErrors }: LeftToAllocateItemsTableProps) => {
    const isMobileView = isMobileViewUI();
    const { newFontStyle } = useStyleContext();

    return (
        <table className="table left-to-allocate-items-table">
            <thead>
                <tr>
                    <th className={newFontStyle ? 'body-medium' : ''}><TranslatedString id="shipping.multishipping_left_to_allocate_items_table_item" /></th>
                    {!isMobileView && <th className={newFontStyle ? 'body-medium' : ''}><TranslatedString id="shipping.multishipping_left_to_allocate_items_table_left_to_allocate" /></th>}
                    <th className={newFontStyle ? 'body-medium' : ''}><TranslatedString id="shipping.multishipping_left_to_allocate_items_table_quantity" /></th>
                </tr>
            </thead>
            <tbody>
                {items.map(item => (
                    <LeftToAllocateItem
                        error={formErrors[item.id.toString()]}
                        item={item}
                        key={item.id}
                    />      
                ))}
            </tbody>
        </table>
    );
}

export default LeftToAllocateItemsTable;
