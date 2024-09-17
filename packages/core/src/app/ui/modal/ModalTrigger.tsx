import React, {
    Component,
    KeyboardEvent,
    KeyboardEventHandler,
    MouseEventHandler,
    ReactNode,
} from 'react';

export interface ModalTriggerProps {
    children(props: { onClick: MouseEventHandler; onKeyPress: KeyboardEventHandler<HTMLDivElement> }): ReactNode;
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

    private canHandleEvent = false;

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
            <>
                {children({
                    onClick: this.handleOpen,
                    onKeyPress: this.handleKeyOpen,
                })}

                {modal({
                    isOpen,
                    onRequestClose: this.handleClose,
                })}
            </>
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

    private handleKeyOpen: (keyboardEvent: KeyboardEvent<HTMLElement>) => void = (
        keyboardEvent,
    ) => {
        if (keyboardEvent.key === 'Enter') {
            this.handleOpen();
        }
    };
}
