import classNames from 'classnames';
import React, { forwardRef, ReactNode, Ref } from 'react';

import Input, { InputProps } from './Input';
import Label from './Label';

export interface CheckboxInputProps extends InputProps {
    additionalClassName?: string;
    label: ReactNode;
    value: string;
    checked: boolean;
    newFontStyle?: boolean;
}

const CheckboxInput = forwardRef(
    (
        { additionalClassName, label, id, testId, newFontStyle = false, ...rest }: CheckboxInputProps,
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
            <Label additionalClassName={newFontStyle ? 'body-regular' : ''} htmlFor={id}>{label}</Label>
        </>
    ),
);

export default CheckboxInput;
