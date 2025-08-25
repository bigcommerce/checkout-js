import React, { type FunctionComponent } from 'react';

export interface HeaderProps {
    children: React.ReactNode;
    testId?: string;
}

const PrimaryHeader: FunctionComponent<HeaderProps> = ({ children, testId }) => (
    <h1 className="optimizedCheckout-headingPrimary" data-test={testId}>
        {children}
    </h1>
);

export default PrimaryHeader;
