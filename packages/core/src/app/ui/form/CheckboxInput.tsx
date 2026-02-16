import classNames from 'classnames';
import React, { forwardRef, type ReactNode, type Ref } from 'react';

import Input, { type InputProps } from './Input';
import Label from './Label';

export interface CheckboxInputProps extends InputProps {
    additionalClassName?: string;
    label: ReactNode;
    value: string;
    checked: boolean;
}

const CheckboxInput = forwardRef(
    (
        { additionalClassName, label, id, testId, ...rest }: CheckboxInputProps,
        ref: Ref<HTMLInputElement>,
    ) => (
        <>
            <Input
                {...rest}
                className={classNames(
                    'form-checkbox',
                    'optimizedCheckout-form-checkbox',
                    additionalClassName,
                )}
                id={id}
                ref={ref}
                testId={testId}
                type="checkbox"
            />
            <Label additionalClassName="body-regular" htmlFor={id}>{label}</Label>
        </>
    ),
);

export default CheckboxInput;
