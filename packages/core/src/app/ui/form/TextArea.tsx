import classNames from 'classnames';
import React, { forwardRef, Ref, TextareaHTMLAttributes } from 'react';

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    additionalClassName?: string;
    testId?: string;
    isFloatingLabelEnabled?: boolean;
}

const TextArea = forwardRef(
    (
        { additionalClassName, testId, className, isFloatingLabelEnabled, ...rest }: TextAreaProps,
        ref: Ref<HTMLTextAreaElement>,
    ) => {
        return (
            <textarea
                {...rest}
                className={
                    className ||
                    classNames(
                        { 'floating-textarea': isFloatingLabelEnabled },
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
