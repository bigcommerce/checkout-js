import React, { forwardRef, InputHTMLAttributes, Ref } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    testId?: string;
}

const Input = forwardRef(({ testId, ...rest }: InputProps, ref: Ref<HTMLInputElement>) => (
    <input {...rest} data-test={testId} ref={ref} />
));

export default Input;
