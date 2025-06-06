import classNames from 'classnames';
import React, { FunctionComponent } from 'react';

export interface LegendProps extends React.HTMLAttributes<HTMLLegendElement> {
    hidden?: boolean;
    testId?: string;
    newFontStyle?: boolean;
}

const Legend: FunctionComponent<LegendProps> = ({
    children,
    className,
    hidden,
    testId,
    newFontStyle = false,
    ...rest
}) => (
    <legend
        {...rest}
        className={classNames(
            className || 'form-legend',
            { 'is-srOnly': hidden },
            { 'optimizedCheckout-headingSecondary': !hidden },
            { 'sub-header': newFontStyle && !hidden },
        )}
        data-test={testId}
    >
        {children}
    </legend>
);

export default Legend;
