import React, { Component, Fragment, MouseEventHandler, ReactNode } from 'react';

export interface ModalTriggerProps {
    children(props: { onClick: MouseEventHandler }): ReactNode;
    modal(props: ModalTriggerModalProps): ReactNode;
}

export interface ModalTriggerModalProps {
    isOpen: boolean;
    onRequestClose(): void;
}

export interface ModalTriggerState {
    isOpen: boolean;
}

export default class ModalTrigger extends Component<ModalTriggerProps, ModalTriggerState> {
    state = {
        isOpen: false,
    };

    private canHandleEvent: boolean = false;

    componentDidMount(): void {
        this.canHandleEvent = true;
    }

    componentWillUnmount(): void {
        this.canHandleEvent = false;
    }

    render() {
        const { children, modal } = this.props;
        const { isOpen } = this.state;

        return (
            <Fragment>
                { children({ onClick: this.handleOpen }) }

                { modal({
                    isOpen,
                    onRequestClose: this.handleClose,
                }) }
            </Fragment>
        );
    }

    private handleOpen: () => void = () => {
        if (!this.canHandleEvent) {
            return;
        }

        this.setState({
            isOpen: true,
        });
    };

    private handleClose: () => void = () => {
        if (!this.canHandleEvent) {
            return;
        }

        this.setState({
            isOpen: false,
        });
    };
}
