import classNames from 'classnames';
import React, { forwardRef, type ReactNode, type Ref } from 'react';

import Input, { type InputProps } from '../Input/Input';
import Label from '../Label/Label';

export interface RadioInputProps extends InputProps {
    additionalClassName?: string;
    label: ReactNode;
    value: string;
    checked: boolean;
}

const RadioInput = forwardRef(
    (
        { additionalClassName, label, value, checked, id, ...rest }: RadioInputProps,
        ref: Ref<HTMLInputElement>,
    ) => (
        <>
            <Input
                {...rest}
                checked={checked}
                className={classNames(
                    'form-radio',
                    'optimizedCheckout-form-radio',
                    additionalClassName,
                )}
                id={id}
                ref={ref}
                type="radio"
                value={value}
            />
            <Label additionalClassName="body-regular" htmlFor={id}>
                {label}
            </Label>
        </>
    ),
);

export default RadioInput;
