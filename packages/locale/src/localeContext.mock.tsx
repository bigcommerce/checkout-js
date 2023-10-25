import { createCurrencyService, createLanguageService } from '@bigcommerce/checkout-sdk';

import { getStoreConfig } from '@bigcommerce/checkout/test-mocks';

import { LocaleContextType } from './LocaleContext';
import { FALLBACK_TRANSLATIONS } from './translations';

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
