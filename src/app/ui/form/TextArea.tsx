import classNames from 'classnames';
import React, { forwardRef, Ref, TextareaHTMLAttributes } from 'react';

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    additionalClassName?: string;
    testId?: string;
    disabled: boolean;
}

const TextArea = forwardRef((
    { additionalClassName, testId, className, disabled, ...rest }: TextAreaProps,
    ref: Ref<HTMLTextAreaElement>
) => (
    <textarea
        { ...rest }
        className={ className || classNames(
            'form-input',
            'optimizedCheckout-form-input',
            additionalClassName
        ) }
        data-test={ testId }
        ref={ ref }
        disabled={ disabled }
    />
));

export default TextArea;
