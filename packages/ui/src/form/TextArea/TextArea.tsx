import classNames from 'classnames';
import React, { forwardRef, Ref, TextareaHTMLAttributes } from 'react';

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    additionalClassName?: string;
    testId?: string;
    isFloatingLabelEnabled?: boolean;
    themeV2?: boolean;
}

const TextArea = forwardRef(
    (
        {
            additionalClassName,
            testId,
            className,
            isFloatingLabelEnabled,
            themeV2,
            ...rest
        }: TextAreaProps,
        ref: Ref<HTMLTextAreaElement>,
    ) => (
        <textarea
            {...rest}
            className={
                className ||
                classNames(
                    'form-input',
                    'optimizedCheckout-form-input',
                    { 'floating-input': isFloatingLabelEnabled },
                    { 'floating-form-field-input': themeV2 },
                    additionalClassName,
                )
            }
            data-test={testId}
            ref={ref}
        />
    ),
);

export default TextArea;
