import classNames from 'classnames';
import React, { FunctionComponent, LabelHTMLAttributes } from 'react';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
    testId?: string;
    hidden?: boolean;
    isFloatingLabelEnabled?: boolean;
}

const Label: FunctionComponent<LabelProps> = ({
    children,
    className,
    hidden,
    testId,
    isFloatingLabelEnabled,
    ...rest
}) => (
    <label
        { ...rest }
        className={ classNames(
            { 'floating-label': isFloatingLabelEnabled },
            className || 'form-label',
            { 'is-srOnly': hidden },
            'optimizedCheckout-form-label'
        ) }
        data-test={ testId }
    >
        { children }
    </label>
);

export default Label;
