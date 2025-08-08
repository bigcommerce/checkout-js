import classNames from 'classnames';
import React, { FunctionComponent, LabelHTMLAttributes } from 'react';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
    testId?: string;
    hidden?: boolean;
    additionalClassName?: string;
    isFloatingLabelEnabled?: boolean;
}

const Label: FunctionComponent<LabelProps> = ({
    children,
    className,
    hidden,
    testId,
    additionalClassName,
    isFloatingLabelEnabled,
    ...rest
}) => (
    <label
        {...rest}
        className={classNames(
            className || 'form-label',
            { 'is-srOnly': hidden },
            { 'floating-form-label': isFloatingLabelEnabled },
            'optimizedCheckout-form-label',
            additionalClassName,
        )}
        data-test={testId}
    >
        {children}
    </label>
);

export default Label;
