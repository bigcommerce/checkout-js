import { CustomerData, Elements } from '@recurly/recurly-js';
import { createContext } from 'react';

export interface RecurlyContextProps {
    isLoadingRecurly: boolean;
    hasSubscription: boolean;
    isSubmitting: boolean;
    submitOrder(elements: Elements, customerInformation: CustomerData): void;
}

const RecurlyContext = createContext<RecurlyContextProps | undefined>(undefined);

export default RecurlyContext;
