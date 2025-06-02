import classNames from 'classnames';
import React, { FunctionComponent } from 'react';

export interface LegendProps extends React.HTMLAttributes<HTMLLegendElement> {
    hidden?: boolean;
    testId?: string;
}

const newFontStyle = true; // Assuming this is a placeholder for the actual condition

const Legend: FunctionComponent<LegendProps> = ({
    children,
    className,
    hidden,
    testId,
    ...rest
}) => (
    <legend
        {...rest}
        className={classNames(
            className || 'form-legend',
            { 'is-srOnly': hidden },
            { 'optimizedCheckout-headingSecondary': !hidden },
            { 'header-secondary': newFontStyle && !hidden },
        )}
        data-test={testId}
    >
        {children}
    </legend>
);

export default Legend;
