import { LanguageConfig } from '@bigcommerce/checkout-sdk';

import getLanguageService, { initializeLanguageService } from './getLanguageService';

describe('getLanguageService', () => {
    let languageConfig: LanguageConfig;

    beforeEach(() => {
        languageConfig = {
            locale: 'en',
            locales: {},
            translations: {},
            defaultTranslations: {
                optimized_checkout: {
                    greeting: 'Hello',
                },
            },
        };
    });

    it('returns fallback language service if not initialized', () => {
        expect(getLanguageService()).toBeDefined();
        expect(getLanguageService().translate('greeting')).toBe('optimized_checkout.greeting');
        expect(getLanguageService().translate('address.address_line_1_label')).toBe('Address');
    });

    it('returns language service if initialized', () => {
        initializeLanguageService(languageConfig);

        expect(getLanguageService()).toBeDefined();
        expect(getLanguageService().translate('greeting')).toBe('Hello');
    });

    it('returns language service with fallback translations', () => {
        initializeLanguageService(languageConfig);

        expect(getLanguageService().translate('address.address_line_1_label')).toBe('Address');
    });

    it('returns language service with override translations', () => {
        initializeLanguageService({
            ...languageConfig,
            locale: 'fr',
            locales: {
                'optimized_checkout.greeting': 'fr',
            },
            translations: {
                'optimized_checkout.greeting': 'Bonjour',
            },
        });

        expect(getLanguageService().translate('greeting')).toBe('Bonjour');
    });
});
