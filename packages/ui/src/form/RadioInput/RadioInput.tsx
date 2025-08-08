import classNames from 'classnames';
import React, { forwardRef, ReactNode, Ref } from 'react';

import Input, { InputProps } from '../Input/Input';
import Label from '../Label/Label';

export interface RadioInputProps extends InputProps {
    additionalClassName?: string;
    label: ReactNode;
    value: string;
    checked: boolean;
    themeV2?: boolean;
}

const RadioInput = forwardRef(
    (
        { additionalClassName, label, value, checked, id, themeV2, ...rest }: RadioInputProps,
        ref: Ref<HTMLInputElement>,
    ) => (
        <>
            <Input
                {...rest}
                checked={checked}
                className={classNames(
                    'form-radio',
                    'optimizedCheckout-form-radio',
                    { 'floating-form-field-input': themeV2 },
                    additionalClassName,
                )}
                id={id}
                ref={ref}
                type="radio"
                value={value}
            />
            <Label htmlFor={id}>{label}</Label>
        </>
    ),
);

export default RadioInput;
