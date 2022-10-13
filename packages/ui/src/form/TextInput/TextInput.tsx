import classNames from 'classnames';
import React, { forwardRef, Ref } from 'react';

import { Input, InputProps } from '../Input';

export interface TextInputProps extends InputProps {
    additionalClassName?: string;
    appearFocused?: boolean;
    type?: 'text' | 'password' | 'tel' | 'email' | 'number';
}

const TextInput = forwardRef(
    (
        { additionalClassName, appearFocused, type = 'text', ...rest }: TextInputProps,
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
        />
    ),
);

export default TextInput;
