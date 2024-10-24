import React, { FunctionComponent } from "react";

import { FormField, TextInput } from "../ui/form";

import { MultiShippingTableItemWithType } from "./MultishippingV2Type";

interface LeftToAllocateItemProps {
    item: MultiShippingTableItemWithType;
    error?: string;
}

const LeftToAllocateItem: FunctionComponent<LeftToAllocateItemProps> = ({ item, error }: LeftToAllocateItemProps) => {
    return (
        <tr>
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
                    additionalClassName={error ? "form-field--error" : ""}
                    input={({ field }) => <TextInput
                        {...field}
                        aria-label={`Quantity of ${item.name}`}
                        disabled={item.quantity === 0}
                        id={field.name}
                        min={0}
                        type="number"
                    />}
                    name={item.id.toString()}
                />
            </td>
        </tr>
    );
}

export default LeftToAllocateItem;
