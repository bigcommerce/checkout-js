import classNames from 'classnames';
import React, { FunctionComponent, LabelHTMLAttributes } from 'react';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
    testId?: string;
    hidden?: boolean;
    isFloatingLabelEnabled?: boolean;
    additionalClassName?: string;
}

const Label: FunctionComponent<LabelProps> = ({
    children,
    className,
    hidden,
    testId,
    isFloatingLabelEnabled,
    additionalClassName,
    ...rest
}) => (
    <label
        { ...rest }
        className={ classNames(
            { 'floating-label': isFloatingLabelEnabled },
            className || 'form-label',
            { 'is-srOnly': hidden },
            'optimizedCheckout-form-label',
            additionalClassName,
        ) }
        data-test={ testId }
    >
        { children }
    </label>
);

export default Label;
