import React, { FunctionComponent } from 'react';

import './Tooltip.scss';

export interface TooltipProps {
    testId?: string;
}

const Tooltip: FunctionComponent<TooltipProps> = ({ children, testId }) => (
    <span className="tooltip tooltip--basic" data-test={testId}>
        {children}
    </span>
);

export default Tooltip;
