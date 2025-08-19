import React, {
    type KeyboardEvent,
    type KeyboardEventHandler,
    type MouseEventHandler,
    type ReactElement,
    type ReactNode,
    useEffect,
    useRef,
    useState,
} from 'react';

export interface ModalTriggerProps {
    children(props: { onClick: MouseEventHandler; onKeyPress: KeyboardEventHandler<HTMLDivElement> }): ReactNode;
    modal(props: ModalTriggerModalProps): ReactNode;
}

export interface ModalTriggerModalProps {
    isOpen: boolean;
    onRequestClose(): void;
}

const ModalTrigger = ({ children, modal }: ModalTriggerProps): ReactElement => {
    const [isOpen, setIsOpen] = useState(false);
    const canHandleEventRef = useRef(false);

    useEffect(() => {
        canHandleEventRef.current = true;

        return () => {
            canHandleEventRef.current = false;
        };
    }, []);

    const handleOpen = (): void => {
        if (!canHandleEventRef.current) {
            return;
        }

        setIsOpen(true);
    };

    const handleClose = (): void => {
        if (!canHandleEventRef.current) {
            return;
        }

        setIsOpen(false);
    };

    const handleKeyOpen = (keyboardEvent: KeyboardEvent<HTMLElement>): void => {
        if (keyboardEvent.key === 'Enter') {
            handleOpen();
        }
    };

    return (
        <>
            {children({
                onClick: handleOpen,
                onKeyPress: handleKeyOpen,
            })}

            {modal({
                isOpen,
                onRequestClose: handleClose,
            })}
        </>
    );
};

export default ModalTrigger;
