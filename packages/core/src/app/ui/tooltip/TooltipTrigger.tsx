import { type Placement } from '@popperjs/core';
import React, { type ReactEventHandler, type ReactNode, useState } from 'react';
import { Manager, Popper, Reference } from 'react-popper';

export interface TooltipTriggerProps {
    placement?: Placement;
    tooltip: ReactNode;
    children: ReactNode;
}

const TooltipTrigger: React.FC<TooltipTriggerProps> = ({
    placement = 'bottom',
    tooltip,
    children,
}) => {
    const [shouldShow, setShouldShow] = useState(false);

    const handleShow: ReactEventHandler<HTMLElement> = () => {
        setShouldShow(true);
    };

    const handleHide: ReactEventHandler<HTMLElement> = () => {
        setShouldShow(false);
    };

    return (
        <Manager>
            <Reference>
                {({ ref }) => (
                    <span
                        onBlur={handleHide}
                        onFocus={handleShow}
                        onMouseEnter={handleShow}
                        onMouseLeave={handleHide}
                        ref={ref}
                    >
                        {children}
                    </span>
                )}
            </Reference>

            <Popper
                modifiers={[
                    { name: 'hide', enabled: false },
                    { name: 'flip', enabled: false },
                    { name: 'preventOverflow', enabled: false },
                ]}
                placement={placement}
            >
                {({ ref, style }) =>
                    shouldShow && (
                        <div ref={ref} style={style}>
                            {tooltip}
                        </div>
                    )
                }
            </Popper>
        </Manager>
    );
};

export default TooltipTrigger;
