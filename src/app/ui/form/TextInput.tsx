import classNames from 'classnames';
import React, { forwardRef, Ref } from 'react';

import Input, { InputProps } from './Input';

export interface TextInputProps extends InputProps {
    additionalClassName?: string;
    type?: 'text' | 'password' | 'tel' | 'email' | 'number';
}

const TextInput = forwardRef((
    {
        additionalClassName,
        type = 'text',
        ...rest
    }: TextInputProps,
    ref: Ref<HTMLInputElement>
) => (
    <Input
        { ...rest }
        className={ classNames(
            'form-input',
            'optimizedCheckout-form-input',
            additionalClassName
        ) }
        ref={ ref }
        type={ type }
    />
));

export default TextInput;
