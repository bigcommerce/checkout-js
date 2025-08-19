import React, {
    type KeyboardEvent,
    type KeyboardEventHandler,
    type MouseEventHandler,
    type ReactNode,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';

export interface ModalTriggerProps {
    children(props: { onClick: MouseEventHandler; onKeyPress: KeyboardEventHandler }): ReactNode;
    modal(props: ModalTriggerModalProps): ReactNode;
}

export interface ModalTriggerModalProps {
    isOpen: boolean;
    onRequestClose(): void;
}

const ModalTrigger: React.FC<ModalTriggerProps> = ({ children, modal }) => {
    const [isOpen, setIsOpen] = useState(false);
    const canHandleEventRef = useRef(false);

    useEffect(() => {
        canHandleEventRef.current = true;

        return () => {
            canHandleEventRef.current = false;
        };
    }, []);

    const handleOpen = useCallback(() => {
        if (!canHandleEventRef.current) {
            return;
        }

        setIsOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        if (!canHandleEventRef.current) {
            return;
        }

        setIsOpen(false);
    }, []);

    const handleKeyOpen = useCallback(
        (keyboardEvent: KeyboardEvent<HTMLElement>) => {
            if (keyboardEvent.key === 'Enter') {
                handleOpen();
            }
        },
        [handleOpen],
    );

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
