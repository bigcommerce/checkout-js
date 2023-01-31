// eslint-disable-next-line import/no-extraneous-dependencies
import { Placement } from 'popper.js';
import React, { Component, MouseEventHandler, ReactNode } from 'react';
import { Manager, Popper, Reference } from 'react-popper';

export interface DropdownTriggerProps {
    placement?: Placement;
    dropdown: ReactNode;
}

export interface DropdownTriggerState {
    shouldShow: boolean;
}

export default class DropdownTrigger extends Component<DropdownTriggerProps, DropdownTriggerState> {
    static defaultProps = {
        placement: 'bottom-start',
    };

    state: Readonly<DropdownTriggerState> = {
        shouldShow: false,
    };

    componentWillUnmount(): void {
        document.removeEventListener('click', this.handleClose);
    }

    render() {
        const { children, placement, dropdown } = this.props;
        const { shouldShow } = this.state;

        return (
            <Manager>
                <Reference>
                    {({ ref }) => (
                        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                        <div className="dropdownTrigger" onClick={this.handleClick} ref={ref}>
                            {children}
                        </div>
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
    }

    private handleClick: MouseEventHandler<HTMLElement> = (event) => {
        const { shouldShow } = this.state;

        if (shouldShow) {
            this.handleClose(event.nativeEvent);
        } else {
            this.handleOpen(event.nativeEvent);
        }
    };

    private handleOpen: (event: MouseEvent) => void = () => {
        const { shouldShow } = this.state;

        if (shouldShow) {
            return;
        }

        this.setState({ shouldShow: true }, () => {
            document.addEventListener('click', this.handleClose);
        });
    };

    private handleClose: (event: MouseEvent) => void = () => {
        const { shouldShow } = this.state;

        if (!shouldShow) {
            return;
        }

        this.setState({ shouldShow: false }, () => {
            document.removeEventListener('click', this.handleClose);
        });
    };
}
