import classNames from "classnames";
import React, { FunctionComponent } from "react";

import { TranslatedString } from "@bigcommerce/checkout/locale";
import { useStyleContext } from '@bigcommerce/checkout/payment-integration-api';

import { FormField, TextInput } from "../ui/form";
import { isMobileView as isMobileViewUI } from "../ui/responsive";

import { MultiShippingTableItemWithType } from "./MultishippingType";

interface LeftToAllocateItemProps {
    item: MultiShippingTableItemWithType;
    error?: string;
}

const LeftToAllocateItem: FunctionComponent<LeftToAllocateItemProps> = ({ item, error }: LeftToAllocateItemProps) => {
    const isMobileView = isMobileViewUI();
    const { newFontStyle } = useStyleContext();

    return (
        <tr>
            <td className="left-to-allocate-item-name-container">
                <figure className="left-to-allocate-item-figure">
                    {item.imageUrl && <img alt={item.name} src={item.imageUrl} />}
                </figure>
                <div>
                    <p className={classNames('left-to-allocate-item-name',
                        { 'body-regular': newFontStyle })}>
                        {item.name}
                    </p>
                    {item.options?.map(option => (
                        <p className={classNames('left-to-allocate-item-option',
                            { 'sub-text-medium': newFontStyle })}
                            key={option.nameId}>
                            {option.name}: {option.value}
                        </p>
                    ))}
                </div>
            </td>
            {!isMobileView && <td className={newFontStyle ? 'body-regular' : ''}>{item.quantity}</td>}
            <td className={newFontStyle ? 'body-regular' : ''}>
                {isMobileView && <TranslatedString data={{ count: item.quantity }} id="shipping.multishipping_left_to_allocate_message" />}
                <FormField
                    additionalClassName={error ? "form-field--error" : ""}
                    input={({ field }) => <TextInput
                        {...field}
                        aria-label={`Quantity of ${item.name}`}
                        disabled={item.quantity === 0}
                        id={field.name}
                        min={0}
                        newFontStyle={newFontStyle}
                        type="number"
                    />}
                    name={item.id.toString()}
                />
            </td>
        </tr>
    );
}

export default LeftToAllocateItem;
