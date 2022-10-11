import classNames from 'classnames';
import React, { forwardRef, Ref, TextareaHTMLAttributes } from 'react';

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    additionalClassName?: string;
    testId?: string;
    useFloatingLabel?: boolean;
}

const TextArea = forwardRef(
    (
        { additionalClassName, testId, className, useFloatingLabel, ...rest }: TextAreaProps,
        ref: Ref<HTMLTextAreaElement>,
    ) => {
        return (
            <textarea
                {...rest}
                className={
                    className ||
                    classNames(
                        { 'floating-textarea': useFloatingLabel },
                        'form-input',
                        'optimizedCheckout-form-input',
                        additionalClassName,
                    )
                }
                data-test={testId}
                ref={ref}
            />
        );
    },
);

export default TextArea;
