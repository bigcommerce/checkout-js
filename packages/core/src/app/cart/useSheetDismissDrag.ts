import { type PointerEvent as ReactPointerEvent, useEffect, useRef } from 'react';

const DRAG_CLOSE_DISTANCE = 40;

type SheetPointerHandler = (event: ReactPointerEvent<HTMLDivElement>) => void;

interface SheetDismissDrag {
    setSheetElement: (element: HTMLDivElement | null) => void;
    handleProps: {
        onPointerCancel: SheetPointerHandler;
        onPointerDown: SheetPointerHandler;
        onPointerMove: SheetPointerHandler;
        onPointerUp: SheetPointerHandler;
    };
}

export const useSheetDismissDrag = (isOpen: boolean, onDismiss: () => void): SheetDismissDrag => {
    const sheetRef = useRef<HTMLDivElement | null>(null);
    const dragStartY = useRef<number | null>(null);

    // react-modal reuses the sheet node when reopened during the close transition,
    // so the swipe dismiss's inline styles must be cleared to let the classes apply
    useEffect(() => {
        const sheet = sheetRef.current;

        if (isOpen && sheet) {
            sheet.style.transition = '';
            sheet.style.transform = '';
        }
    }, [isOpen]);

    const setSheetElement = (element: HTMLDivElement | null) => {
        sheetRef.current = element;
    };

    const handlePointerDown: SheetPointerHandler = (event) => {
        dragStartY.current = event.clientY;
        event.currentTarget.setPointerCapture?.(event.pointerId);

        if (sheetRef.current) {
            sheetRef.current.style.transition = 'none';
        }
    };

    const handlePointerMove: SheetPointerHandler = (event) => {
        const sheet = sheetRef.current;

        if (dragStartY.current === null || !sheet) {
            return;
        }

        const offset = Math.max(0, event.clientY - dragStartY.current);

        sheet.style.transform = `translateY(${offset}px)`;
    };

    const handlePointerUp: SheetPointerHandler = (event) => {
        const sheet = sheetRef.current;

        if (dragStartY.current === null || !sheet) {
            return;
        }

        sheet.style.transition = '';

        if (event.clientY - dragStartY.current > DRAG_CLOSE_DISTANCE) {
            // Must match the sheet's closing transform so the slide continues from the drop position
            sheet.style.transform = 'translateY(100%)';
            onDismiss();
        } else {
            sheet.style.transform = '';
        }

        dragStartY.current = null;
    };

    return {
        setSheetElement,
        handleProps: {
            onPointerCancel: handlePointerUp,
            onPointerDown: handlePointerDown,
            onPointerMove: handlePointerMove,
            onPointerUp: handlePointerUp,
        },
    };
};
