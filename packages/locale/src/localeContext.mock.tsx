import { createCurrencyService, createLanguageService } from '@bigcommerce/checkout-sdk';

import { getStoreConfig } from '../config/config.mock';
import { FALLBACK_TRANSLATIONS } from '../locale/translations';

import { LocaleContextType } from './LocaleContext';

export function getLocaleContext(): Required<LocaleContextType> {
    return {
        currency: createCurrencyService(getStoreConfig()),
        date: {
            inputFormat: 'dd/mm/yyyy',
        },
        language: createLanguageService({
            ...(window as any).language,
            defaultTranslations: FALLBACK_TRANSLATIONS,
        }),
    };
}
