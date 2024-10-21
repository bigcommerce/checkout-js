import React, { FunctionComponent } from "react";

import { FormField, TextInput } from "../ui/form";

import { MultiShippingTableItemWithType } from "./hooks/useMultishippingConsignmentItems";

interface LeftToAllocateItemsTableProps {
    items: MultiShippingTableItemWithType[];
}

const LeftToAllocateItemsTable: FunctionComponent<LeftToAllocateItemsTableProps> = ({ items }: LeftToAllocateItemsTableProps) => {
    return <table className="table left-to-allocate-items-table">
        <thead>
            <tr>
                <th>Item</th>
                <th>Left to allocate</th>
                <th>Quantity</th>
            </tr>
        </thead>
        <tbody>
            {items.map(item => (
                <tr key={item.id}>
                    <td className="left-to-allocate-item-name-container">
                        <figure className="left-to-allocate-item-figure">
                            {item.imageUrl && <img alt={item.name} src={item.imageUrl} />}
                        </figure>
                        <div className="left-to-allocate-item-name">
                            <p>{item.name}</p>
                            {item.options?.map(option => (
                                <p className="left-to-allocate-item-option" key={option.nameId}>{option.name}: {option.value}</p>
                            ))}
                        </div>
                    </td>
                    <td>{item.quantity}</td>
                    <td>
                        <FormField
                            input={({ field }) => <TextInput {...field} disabled={item.quantity === 0} id={field.name} type="number" />}
                            name={item.id.toString()}
                        />
                    </td>
                </tr>
            ))}
        </tbody>
    </table>;
}

export default LeftToAllocateItemsTable;
