 
import { Placement } from 'popper.js';
import React, { Component, ReactEventHandler, ReactNode } from 'react';
import { Manager, Popper, Reference } from 'react-popper';

export interface TooltipTriggerProps {
    placement?: Placement;
    tooltip: ReactNode;
}

export interface TooltipTriggerState {
    shouldShow: boolean;
}

export default class TooltipTrigger extends Component<TooltipTriggerProps, TooltipTriggerState> {
    static defaultProps = {
        placement: 'bottom',
    };

    state: Readonly<TooltipTriggerState> = {
        shouldShow: false,
    };

    render() {
        const { children, placement, tooltip } = this.props;
        const { shouldShow } = this.state;

        return (
            <Manager>
                <Reference>
                    {({ ref }) => (
                        <span
                            onBlur={this.handleHide}
                            onFocus={this.handleShow}
                            onMouseEnter={this.handleShow}
                            onMouseLeave={this.handleHide}
                            ref={ref}
                        >
                            {children}
                        </span>
                    )}
                </Reference>

                <Popper
                    modifiers={{
                        hide: { enabled: false },
                        flip: { enabled: false },
                        preventOverflow: { enabled: false },
                    }}
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
    }

    private handleShow: ReactEventHandler<HTMLElement> = () => {
        this.setState({ shouldShow: true });
    };

    private handleHide: ReactEventHandler<HTMLElement> = () => {
        this.setState({ shouldShow: false });
    };
}
