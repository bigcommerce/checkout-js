import { CurrencyService, LanguageService } from '@bigcommerce/checkout-sdk';
import { createContext, useContext } from 'react';

export interface LocaleContextType {
    language: LanguageService;
    date?: {
        inputFormat: string;
    };
    currency?: CurrencyService;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export default LocaleContext;

export function useLocale() {
    const context = useContext(LocaleContext);

    if (!context) {
        throw new Error('useLocale must be used within a LocaleContextProvider');
    }

    return context;
}
