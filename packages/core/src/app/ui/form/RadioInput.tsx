import classNames from 'classnames';
import React, { forwardRef, ReactNode, Ref } from 'react';

import Input, { InputProps } from './Input';
import Label from './Label';

export interface RadioInputProps extends InputProps {
    additionalClassName?: string;
    label: ReactNode;
    value: string;
    checked: boolean;
    themeV2?: boolean;
}

const RadioInput = forwardRef(
    (
        { additionalClassName, label, value, checked, id, themeV2 = false, ...rest }: RadioInputProps,
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
            <Label additionalClassName={themeV2 ? 'body-regular' : ''} htmlFor={id}>{label}</Label>
        </>
    ),
);

export default RadioInput;
