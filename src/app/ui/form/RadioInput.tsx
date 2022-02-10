import classNames from 'classnames';
import React, { forwardRef, ReactNode, Ref } from 'react';

import Input, { InputProps } from './Input';
import Label from './Label';

export interface RadioInputProps extends InputProps {
    additionalClassName?: string;
    label: ReactNode;
    value: string;
    checked: boolean;
    disabled: boolean;
}

const RadioInput = forwardRef((
    {
        additionalClassName,
        label,
        value,
        checked,
        id,
        disabled,
        ...rest
    }: RadioInputProps,
    ref: Ref<HTMLInputElement>
) => (
    <>
        <Input
            { ...rest }
            checked={ checked }
            className={ classNames(
                'form-radio',
                'optimizedCheckout-form-radio',
                additionalClassName
            ) }
            id={ id }
            ref={ ref }
            type="radio"
            value={ value }
            disabled={ disabled }
        />
        <Label htmlFor={ id }>
            { label }
        </Label>
    </>
));

export default RadioInput;
