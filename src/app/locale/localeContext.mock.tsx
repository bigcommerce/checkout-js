import { createCurrencyService, createLanguageService } from '@bigcommerce/checkout-sdk';

import { getStoreConfig } from '../config/config.mock';
import defaultTranslations from '../language/en.json';

import { LocaleContextType } from './LocaleContext';

export function getLocaleContext(): Required<LocaleContextType> {
    return {
        currency: createCurrencyService(getStoreConfig()),
        language: createLanguageService({ ...(window as any).language, defaultTranslations }),
    };
}
