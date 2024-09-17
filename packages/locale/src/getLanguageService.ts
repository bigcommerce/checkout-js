import { createLanguageService, LanguageConfig, LanguageService } from '@bigcommerce/checkout-sdk';

import { FALLBACK_LOCALE, FALLBACK_TRANSLATIONS } from './translations';

let languageService: LanguageService | undefined;

export default function getLanguageService(): LanguageService {
    languageService =
        languageService ??
        createLanguageService({
            fallbackLocale: FALLBACK_LOCALE,
            fallbackTranslations: FALLBACK_TRANSLATIONS,
        });

    return languageService;
}

export type InitializeLanguageService = typeof initializeLanguageService;

export function initializeLanguageService(config: LanguageConfig): LanguageService {
    languageService = createLanguageService({
        ...config,
        defaultLocale: config.locale,
        defaultTranslations: config.defaultTranslations,
        fallbackLocale: FALLBACK_LOCALE,
        fallbackTranslations: FALLBACK_TRANSLATIONS,
    });

    return languageService;
}
