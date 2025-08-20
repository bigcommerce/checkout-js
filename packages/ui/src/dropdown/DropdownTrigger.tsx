// eslint-disable-next-line import/no-extraneous-dependencies
import { Placement } from '@popperjs/core';
import React, { MouseEventHandler, ReactNode, useCallback, useEffect, useState } from 'react';
import { Manager, Popper, Reference } from 'react-popper';

import {
    CHECKOUT_ROOT_NODE_ID,
    MICRO_APP_NG_CHECKOUT_ROOT_NODE_ID,
} from '@bigcommerce/checkout/payment-integration-api';

export interface DropdownTriggerProps {
    placement?: Placement;
    dropdown: ReactNode;
    children?: ReactNode;
}

const DropdownTrigger: React.FC<DropdownTriggerProps> = ({
    placement = 'bottom-start',
    dropdown,
    children,
}) => {
    const [shouldShow, setShouldShow] = useState(false);

    const getRootElement = useCallback(() => {
        return (
            document.getElementById(CHECKOUT_ROOT_NODE_ID) ||
            document.getElementById(MICRO_APP_NG_CHECKOUT_ROOT_NODE_ID)
        );
    }, []);

    const handleClose = useCallback(() => {
        if (!shouldShow) {
            return;
        }

        setShouldShow(false);
    }, [shouldShow]);

    const handleOpen = useCallback(() => {
        if (shouldShow) {
            return;
        }

        setShouldShow(true);
    }, [shouldShow]);

    const handleClick: MouseEventHandler<HTMLElement> = useCallback(() => {
        if (shouldShow) {
            handleClose();
        } else {
            handleOpen();
        }
    }, [shouldShow, handleClose, handleOpen]);

    useEffect(() => {
        const rootElement = getRootElement();

        if (shouldShow) {
            rootElement?.addEventListener('click', handleClose);
        }

        return () => {
            rootElement?.removeEventListener('click', handleClose);
        };
    }, [shouldShow, handleClose, getRootElement]);

    return (
        <Manager>
            <Reference>
                {({ ref }) => (
                    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                    <div className="dropdownTrigger" onClick={handleClick} ref={ref}>
                        {children}
                    </div>
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
                    !shouldShow ? null : (
                        <div
                            className="dropdownMenu"
                            ref={ref}
                            style={{
                                ...style,
                                width: '100%',
                                zIndex: 1,
                            }}
                        >
                            {dropdown}
                        </div>
                    )
                }
            </Popper>
        </Manager>
    );
};

export default DropdownTrigger;
