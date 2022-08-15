import { noop } from 'lodash';
import { createContext } from 'react';

export interface AccordionContextProps {
    selectedItemId?: string;
    onToggle(id: string): void;
}

const AccordionContext = createContext<AccordionContextProps>({ onToggle: noop });

export default AccordionContext;
