import React, { FunctionComponent, ReactNode } from 'react';

import './Popover.scss';

export interface PopoverProps {
    children?: ReactNode;
}

const Popover: FunctionComponent<PopoverProps> = ({ children }) => {
    return <div className="popover">{children}</div>;
};

export default Popover;
