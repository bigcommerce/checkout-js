import { memoizeOne } from '@bigcommerce/memoize';
import { noop } from 'lodash';
import React, { type ReactNode, useState } from 'react';

import AccordionContext from './AccordionContext';

export interface AccordionProps {
    children?: ReactNode;
    className?: string;
    defaultSelectedItemId?: string;
    isDisabled?: boolean;
    onSelect?(id: string): void;
}

const Accordion = ({
    children,
    className = 'accordion',
    defaultSelectedItemId,
    isDisabled,
    onSelect = noop,
}: AccordionProps) => {
    const [selectedItemId, setSelectedItemId] = useState<string | undefined>(defaultSelectedItemId);

    const handleToggleItem: (id: string) => void = (id) => {
        if (isDisabled) {
            return;
        }

        setSelectedItemId(id);
        onSelect(id);
    };

    const getContextValue = memoizeOne((newSelectedItemId?: string) => {
        return {
            onToggle: handleToggleItem,
            selectedItemId: newSelectedItemId,
        };
    });

    return (
        <AccordionContext.Provider value={getContextValue(selectedItemId)}>
            <ul className={className}>{children}</ul>
        </AccordionContext.Provider>
    );
};

export default Accordion;
