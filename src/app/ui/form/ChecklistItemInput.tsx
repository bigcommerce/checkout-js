import React, { FunctionComponent, InputHTMLAttributes } from 'react';

import Input from './Input';
import Label from './Label';

export interface ChecklistItemInputProps extends InputHTMLAttributes<HTMLInputElement> {
    isSelected: boolean;
}

const ChecklistItemInput: FunctionComponent<ChecklistItemInputProps> = ({
    isSelected,
    children,
    ...props
}) => (
    <>
        <Input
            { ...props }
            checked={ isSelected }
            className="form-checklist-checkbox optimizedCheckout-form-checklist-checkbox"
            type="radio"
        />

        <Label htmlFor={ props.id }>
            { children }
        </Label>
    </>
);

export default ChecklistItemInput;
