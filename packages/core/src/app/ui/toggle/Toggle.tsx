import { type ReactNode, useState } from 'react';

export interface ToggleProps {
    openByDefault?: boolean;
    children: (props: { toggle: any; isOpen: boolean }) => ReactNode;
}

const Toggle = ({ openByDefault, children }: ToggleProps): ReactNode => {
    const [isOpen, setIsOpen] = useState(Boolean(openByDefault));

    const toggle = (event: Event) => {
        event.preventDefault();
        setIsOpen(!isOpen);
    };

    return children({ isOpen, toggle });
};

export default Toggle;
