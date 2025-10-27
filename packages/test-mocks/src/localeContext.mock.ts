import {
    createCurrencyService,
    createLanguageService,
    type Translations,
} from '@bigcommerce/checkout-sdk';

import { getStoreConfig } from './config.mock';

export function getLocaleContext(translations: Translations = {}) {
    return {
        currency: createCurrencyService(getStoreConfig()),
        date: {
            inputFormat: getStoreConfig().inputDateFormat,
        },
        language: createLanguageService({
            fallbackLocale: 'en',
            fallbackTranslations: translations,
        }),
    };
}
