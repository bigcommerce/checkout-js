import {
    createCurrencyService,
    createLanguageService,
    LanguageService,
    StoreConfig,
} from '@bigcommerce/checkout-sdk';

import FALLBACK_TRANSLATIONS from '../en.json';

import { LocaleContextType } from './LocaleContext';

export const FALLBACK_LOCALE = 'en';

let languageService: LanguageService | undefined;

function getLanguageService(): LanguageService {
    languageService =
        languageService ??
        createLanguageService({
            fallbackLocale: FALLBACK_LOCALE,
            fallbackTranslations: FALLBACK_TRANSLATIONS,
        });

    return languageService;
}

export default function createLocaleContext(config: StoreConfig): Required<LocaleContextType> {
    const { inputDateFormat } = config;

    return {
        currency: createCurrencyService(config),
        date: {
            inputFormat: inputDateFormat,
        },
        language: getLanguageService(),
    };
}
