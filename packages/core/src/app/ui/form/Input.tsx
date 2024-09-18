import classNames from 'classnames';
import { includes } from 'lodash';
import React, { forwardRef, InputHTMLAttributes, Ref } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    testId?: string;
    isFloatingLabelEnabled?: boolean;
}

const Input = forwardRef(
    (
        { className, testId, placeholder, name, isFloatingLabelEnabled, ...rest }: InputProps,
        ref: Ref<HTMLInputElement>,
    ) => {
        const floatingLabelDisabledFieldNames = ['orderComment', 'redeemableCode'];

        return (
            <input
                {...{
                    ...rest,
                    className: classNames(className, {
                        'floating-input':
                            isFloatingLabelEnabled && !includes(floatingLabelDisabledFieldNames, name),
                    }),
                    name,
                }}
                data-test={testId}
                placeholder={isFloatingLabelEnabled ? ' ' : placeholder}
                ref={ref}
            />
        );
    },
);

export default Input;
