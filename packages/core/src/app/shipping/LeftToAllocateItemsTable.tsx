import { type FormikErrors } from "formik";
import React, { type FunctionComponent } from "react";

import { useThemeContext } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from '@bigcommerce/checkout/locale';

import { isMobileView as isMobileViewUI } from "../ui/responsive";

import { type AllocateItemsModalFormValues } from "./AllocateItemsModal";
import LeftToAllocateItem from "./LeftToAllocateItem";
import { type MultiShippingTableItemWithType } from "./MultishippingType";

interface LeftToAllocateItemsTableProps {
    items: MultiShippingTableItemWithType[];
    formErrors: FormikErrors<AllocateItemsModalFormValues>;
}

const LeftToAllocateItemsTable: FunctionComponent<LeftToAllocateItemsTableProps> = ({ items, formErrors }: LeftToAllocateItemsTableProps) => {
    const isMobileView = isMobileViewUI();
    const { themeV2 } = useThemeContext();

    return (
        <table className="table left-to-allocate-items-table">
            <thead>
                <tr>
                    <th className={themeV2 ? 'body-medium' : ''}><TranslatedString id="shipping.multishipping_left_to_allocate_items_table_item" /></th>
                    {!isMobileView && <th className={themeV2 ? 'body-medium' : ''}><TranslatedString id="shipping.multishipping_left_to_allocate_items_table_left_to_allocate" /></th>}
                    <th className={themeV2 ? 'body-medium' : ''}><TranslatedString id="shipping.multishipping_left_to_allocate_items_table_quantity" /></th>
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
