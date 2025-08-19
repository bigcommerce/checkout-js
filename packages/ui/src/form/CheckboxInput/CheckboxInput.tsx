import classNames from 'classnames';
import React, { forwardRef, type ReactNode, type Ref } from 'react';

import { Input, type InputProps } from '../Input';
import { Label } from '../Label';

export interface CheckboxInputProps extends InputProps {
    additionalClassName?: string;
    label: ReactNode;
    value: string;
    checked: boolean;
    themeV2?: boolean;
}

const CheckboxInput = forwardRef(
    (
        { additionalClassName, label, id, themeV2, ...rest }: CheckboxInputProps,
        ref: Ref<HTMLInputElement>,
    ) => (
        <>
            <Input
                {...rest}
                className={classNames(
                    'form-checkbox',
                    'optimizedCheckout-form-checkbox',
                    { 'floating-form-field-input': themeV2 },
                    additionalClassName,
                )}
                id={id}
                ref={ref}
                type="checkbox"
            />
            <Label htmlFor={id}>{label}</Label>
        </>
    ),
);

export default CheckboxInput;
