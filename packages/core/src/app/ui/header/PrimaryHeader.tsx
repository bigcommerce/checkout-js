import React, { FunctionComponent } from 'react';

export interface HeaderProps {
    testId?: string;
}

const PrimaryHeader: FunctionComponent<HeaderProps> = ({ children, testId }) => (
    <h1 className="optimizedCheckout-headingPrimary" data-test={testId}>
        {children}
    </h1>
);

export default PrimaryHeader;
