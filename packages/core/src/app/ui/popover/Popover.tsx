import React, { FunctionComponent } from 'react';

import './Popover.scss';

export interface PopoverProps {
    children: React.ReactNode;
}

const Popover: FunctionComponent<PopoverProps> = ({ children }) => {
    return <div className="popover">{children}</div>;
};

export default Popover;
