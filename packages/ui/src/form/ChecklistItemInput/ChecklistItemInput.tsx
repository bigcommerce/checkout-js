import classNames from 'classnames';
import React, { type FunctionComponent, type InputHTMLAttributes } from 'react';

import { Input } from '../Input';
import { Label } from '../Label';

export interface ChecklistItemInputProps extends InputHTMLAttributes<HTMLInputElement> {
    isSelected: boolean;
}

const ChecklistItemInput: FunctionComponent<ChecklistItemInputProps> = ({
    id,
    isSelected,
    children,
    disabled,
    'aria-disabled': ariaDisabled,
    ...props
}) => (
    <>
        <Input
            {...props}
            aria-disabled={ariaDisabled}
            checked={isSelected}
            className={classNames(
                'form-checklist-checkbox optimizedCheckout-form-checklist-checkbox',
                { 'form-checklist-checkbox--disabled': disabled || ariaDisabled === true },
            )}
            disabled={disabled}
            id={id}
            type="radio"
        />

        <Label htmlFor={id}>{children}</Label>
    </>
);

export default ChecklistItemInput;
