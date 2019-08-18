import { createCurrencyService, createLanguageService } from '@bigcommerce/checkout-sdk';

import { getStoreConfig } from '../config/config.mock';
import { DEFAULT_TRANSLATIONS } from '../locale/translations';

import { LocaleContextType } from './LocaleContext';

export function getLocaleContext(): Required<LocaleContextType> {
    return {
        currency: createCurrencyService(getStoreConfig()),
        language: createLanguageService({
            ...(window as any).language,
            defaultTranslations: DEFAULT_TRANSLATIONS,
        }),
    };
}
