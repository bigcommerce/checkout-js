import classNames from 'classnames';
import React, { forwardRef, Ref } from 'react';

import Input, { InputProps } from './Input';

export interface TextInputProps extends InputProps {
    additionalClassName?: string;
    appearFocused?: boolean;
    type?: 'text' | 'password' | 'tel' | 'email' | 'number';
    useFloatingLabel?: boolean;
}

const TextInput = forwardRef(
    (
        {
            additionalClassName,
            useFloatingLabel,
            appearFocused,
            type = 'text',
            ...rest
        }: TextInputProps,
        ref: Ref<HTMLInputElement>,
    ) => (
        <Input
            {...rest}
            className={classNames(
                'form-input',
                'optimizedCheckout-form-input',
                { 'form-input--focus': appearFocused },
                { 'optimizedCheckout-form-input--focus': appearFocused },
                additionalClassName,
            )}
            ref={ref}
            type={type}
            useFloatingLabel={useFloatingLabel}
        />
    ),
);

export default TextInput;
