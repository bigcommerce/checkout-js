import React, { type FunctionComponent } from 'react';

interface PrimaryHeaderProps {
    children: React.ReactNode;
    testId?: string;
}

export const PrimaryHeader: FunctionComponent<PrimaryHeaderProps> = ({ children, testId }) => (
    <h1 className="optimizedCheckout-headingPrimary" data-test={testId}>
        {children}
    </h1>
);
