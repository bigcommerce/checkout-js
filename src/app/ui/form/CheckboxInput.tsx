import classNames from 'classnames';
import React, { forwardRef, ReactNode, Ref } from 'react';

import Input, { InputProps } from './Input';
import Label from './Label';

export interface CheckboxInputProps extends InputProps {
    additionalClassName?: string;
    label: ReactNode;
    value: string;
    checked: boolean;
    disabled?: boolean;
}

const CheckboxInput = forwardRef((
    {
        additionalClassName,
        label,
        id,
        disabled = false,
        ...rest
    }: CheckboxInputProps,
    ref: Ref<HTMLInputElement>
) => (
    <>
        <Input
            { ...rest }
            className={ classNames(
                'form-checkbox',
                'optimizedCheckout-form-checkbox',
                additionalClassName
            ) }
            disabled={ disabled }
            id={ id }
            ref={ ref }
            type="checkbox"
        />
        <Label htmlFor={ id }>
            { label }
        </Label>
    </>
));

export default CheckboxInput;
