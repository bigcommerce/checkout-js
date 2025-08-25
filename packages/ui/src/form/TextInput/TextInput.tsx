import classNames from 'classnames';
import React, { forwardRef, type Ref } from 'react';

import { Input, type InputProps } from '../Input';

export interface TextInputProps extends InputProps {
    additionalClassName?: string;
    appearFocused?: boolean;
    type?: 'text' | 'password' | 'tel' | 'email' | 'number';
    isFloatingLabelEnabled?: boolean;
    themeV2?: boolean;
}

const TextInput = forwardRef(
    (
        {
            additionalClassName,
            isFloatingLabelEnabled,
            appearFocused,
            type = 'text',
            themeV2 = false,
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
                { 'floating-form-field-input': themeV2 && isFloatingLabelEnabled },
                { 'body-regular': themeV2 && !isFloatingLabelEnabled },
            )}
            isFloatingLabelEnabled={isFloatingLabelEnabled}
            ref={ref}
            type={type}
        />
    ),
);

export default TextInput;
