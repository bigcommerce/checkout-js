import { FormikErrors } from "formik";
import React, { FunctionComponent } from "react";

import { AllocateItemsModalFormValues } from "./AllocateItemsModal";
import LeftToAllocateItem from "./LeftToAllocateItem";
import { MultiShippingTableItemWithType } from "./MultishippingV2Type";

interface LeftToAllocateItemsTableProps {
    items: MultiShippingTableItemWithType[];
    formErrors: FormikErrors<AllocateItemsModalFormValues>;
}

const LeftToAllocateItemsTable: FunctionComponent<LeftToAllocateItemsTableProps> = ({ items, formErrors }: LeftToAllocateItemsTableProps) => {
    return (
        <table className="table left-to-allocate-items-table">
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Left to allocate</th>
                    <th>Quantity</th>
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
