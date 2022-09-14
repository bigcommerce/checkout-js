import classNames from 'classnames';
import React, { FunctionComponent } from 'react';

export interface LegendProps extends React.HTMLAttributes<HTMLLegendElement> {
    hidden?: boolean;
    testId?: string;
}

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
        )}
        data-test={testId}
    >
        {children}
    </legend>
);

export default Legend;
