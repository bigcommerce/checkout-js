import React, { forwardRef, InputHTMLAttributes, Ref } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    testId?: string;
}

const Input = forwardRef((
    { testId, disabled, ...rest }: InputProps,
    ref: Ref<HTMLInputElement>
) => (
    <input
        { ...rest }
        data-test={ testId }
        ref={ ref }
        disabled={ disabled ? disabled : false }
    />
));

export default Input;
