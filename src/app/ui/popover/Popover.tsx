import React from 'react';

import './Popover.scss';

interface PopoverProps {
    children: React.ReactNode;
}

const Popover: React.SFC<PopoverProps> = ({ children }) => {
    return (
        <div className="popover">
            { children }
        </div>
    );
};

export default Popover;
