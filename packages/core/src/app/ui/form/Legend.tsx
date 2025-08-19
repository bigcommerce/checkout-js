import classNames from 'classnames';
import React, { type FunctionComponent } from 'react';

export interface LegendProps extends React.HTMLAttributes<HTMLLegendElement> {
    hidden?: boolean;
    testId?: string;
    themeV2?: boolean;
}

const Legend: FunctionComponent<LegendProps> = ({
    children,
    className,
    hidden,
    testId,
    themeV2 = false,
    ...rest
}) => (
    <legend
        {...rest}
        className={classNames(
            className || 'form-legend',
            { 'is-srOnly': hidden },
            { 'optimizedCheckout-headingSecondary': !hidden },
            { 'sub-header': themeV2 && !hidden },
        )}
        data-test={testId}
    >
        {children}
    </legend>
);

export default Legend;
