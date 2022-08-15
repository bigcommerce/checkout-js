import { CurrencyService, LanguageService } from '@bigcommerce/checkout-sdk';
import { createContext } from 'react';

export interface LocaleContextType {
    language: LanguageService;
    date?: {
        inputFormat: string;
    };
    currency?: CurrencyService;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export default LocaleContext;
