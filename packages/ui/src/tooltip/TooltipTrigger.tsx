import { type Placement } from '@popperjs/core';
import React, {
    type KeyboardEvent,
    type MouseEvent,
    type ReactEventHandler,
    type ReactNode,
    useId,
    useRef,
    useState,
} from 'react';
import { Manager, Popper, Reference } from 'react-popper';

import './TooltipTrigger.scss';

interface TooltipTriggerProps {
    ariaLabel?: string;
    placement?: Placement;
    tooltip: ReactNode;
    children?: ReactNode;
}

const TooltipTrigger: React.FC<TooltipTriggerProps> = ({
    ariaLabel,
    children,
    placement = 'bottom',
    tooltip,
}) => {
    const [shouldShow, setShouldShow] = useState(false);
    const isPointerOverTooltipRef = useRef(false);
    const tooltipId = useId();

    const handleShow: ReactEventHandler<HTMLElement> = () => {
        setShouldShow(true);
    };

    const handleHide: ReactEventHandler<HTMLElement> = () => {
        isPointerOverTooltipRef.current = false;
        setShouldShow(false);
    };

    const handleBlur: ReactEventHandler<HTMLElement> = () => {
        if (!isPointerOverTooltipRef.current) {
            setShouldShow(false);
        }
    };

    const handleTooltipEnter: ReactEventHandler<HTMLElement> = () => {
        isPointerOverTooltipRef.current = true;
        setShouldShow(true);
    };

    const handleClick = (event: MouseEvent<HTMLElement>) => {
        event.preventDefault();
        setShouldShow(true);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        if (event.key === 'Escape' && shouldShow) {
            event.stopPropagation();
            isPointerOverTooltipRef.current = false;
            setShouldShow(false);
        }
    };

    const triggerProps = {
        onBlur: handleBlur,
        onFocus: handleShow,
        onMouseEnter: handleShow,
        onMouseLeave: handleHide,
    };

    return (
        <Manager>
            <Reference>
                {({ ref }) =>
                    ariaLabel ? (
                        <span
                            {...triggerProps}
                            aria-describedby={shouldShow ? tooltipId : undefined}
                            aria-label={ariaLabel}
                            className="tooltip-trigger"
                            onClick={handleClick}
                            onKeyDown={handleKeyDown}
                            ref={ref}
                            role="button"
                            tabIndex={0}
                        >
                            {children}
                        </span>
                    ) : (
                        <span {...triggerProps} ref={ref}>
                            {children}
                        </span>
                    )
                }
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
                        <div
                            id={tooltipId}
                            onMouseEnter={handleTooltipEnter}
                            onMouseLeave={handleHide}
                            ref={ref}
                            role="tooltip"
                            style={style}
                        >
                            {tooltip}
                        </div>
                    )
                }
            </Popper>
        </Manager>
    );
};

export default TooltipTrigger;
