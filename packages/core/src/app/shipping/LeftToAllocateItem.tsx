import React, { type FunctionComponent } from "react";

import { TranslatedString } from "@bigcommerce/checkout/locale";

import { FormField, TextInput } from "../ui/form";
import { isMobileView as isMobileViewUI } from "../ui/responsive";

import { type MultiShippingTableItemWithType } from "./MultishippingType";

interface LeftToAllocateItemProps {
    item: MultiShippingTableItemWithType;
    error?: string;
}

const LeftToAllocateItem: FunctionComponent<LeftToAllocateItemProps> = ({ item, error }: LeftToAllocateItemProps) => {
    const isMobileView = isMobileViewUI();

    return (
        <tr>
            <td className="left-to-allocate-item-name-container">
                <figure className="left-to-allocate-item-figure">
                    {item.imageUrl && <img alt={item.name} src={item.imageUrl} />}
                </figure>
                <div>
                    <p className="left-to-allocate-item-name body-regular">
                        {item.name}
                    </p>
                    {item.options?.map(option => (
                        <p className="left-to-allocate-item-option sub-text-medium"
                            key={option.nameId}>
                            {option.name}: {option.value}
                        </p>
                    ))}
                </div>
            </td>
            {!isMobileView && <td className="body-regular">{item.quantity}</td>}
            <td className="body-regular">
                {isMobileView && <TranslatedString data={{ count: item.quantity }} id="shipping.multishipping_left_to_allocate_message" />}
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
