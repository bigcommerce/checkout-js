import classNames from 'classnames';
import { includes } from 'lodash';
import React, { forwardRef, InputHTMLAttributes, Ref } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    testId?: string;
    useFloatingLabel?: boolean;
}

const Input = forwardRef(
    (
        { className, testId, placeholder, name, useFloatingLabel, ...rest }: InputProps,
        ref: Ref<HTMLInputElement>,
    ) => {
        const notUseFloatingLabelFieldNames = ['orderComment', 'redeemableCode'];

        return (
            <input
                {...{
                    ...rest,
                    className: classNames(className, {
                        'floating-input':
                            useFloatingLabel && !includes(notUseFloatingLabelFieldNames, name),
                    }),
                    name,
                }}
                data-test={testId}
                placeholder={useFloatingLabel ? ' ' : placeholder}
                ref={ref}
            />
        );
    },
);

export default Input;
