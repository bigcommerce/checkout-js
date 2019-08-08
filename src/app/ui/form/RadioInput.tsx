import classNames from 'classnames';
import React, { forwardRef, ReactNode, Ref } from 'react';

import Input, { InputProps } from './Input';
import Label from './Label';

export interface RadioInputProps extends InputProps {
    additionalClassName?: string;
    label: ReactNode;
    value: string;
    checked: boolean;
}

const RadioInput = forwardRef((
    {
        additionalClassName,
        label,
        value,
        checked,
        id,
        ...rest
    }: RadioInputProps,
    ref: Ref<HTMLInputElement>
) => (
    <>
        <Input
            { ...rest }
            className={ classNames(
                'form-radio',
                'optimizedCheckout-form-radio',
                additionalClassName
            ) }
            ref={ ref }
            type="radio"
            value={ value }
            id={ id }
            checked={ checked }
        />
        <Label htmlFor={ id }>
            { label }
        </Label>
    </>
));

export default RadioInput;
