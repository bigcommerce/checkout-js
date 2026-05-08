import { type MouseEvent, type ReactNode, useState } from 'react';

interface ToggleProps {
    openByDefault?: boolean;
    children: (props: { toggle: (event: MouseEvent) => void; isOpen: boolean }) => ReactNode;
}

export const Toggle = ({ openByDefault, children }: ToggleProps): ReactNode => {
    const [isOpen, setIsOpen] = useState(Boolean(openByDefault));

    const toggle = (event: MouseEvent) => {
        event.preventDefault();
        setIsOpen(!isOpen);
    };

    return children({ isOpen, toggle });
};
