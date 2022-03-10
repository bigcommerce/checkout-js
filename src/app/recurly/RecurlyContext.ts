import { createContext } from 'react';

export interface RecurlyContextProps {
    isLoadingRecurly: boolean;
    hasSubscription: boolean;
}

const RecurlyContext = createContext<RecurlyContextProps | undefined>(undefined);

export default RecurlyContext;
