import { LanguageConfig } from '@bigcommerce/checkout-sdk';

export default interface LanguageWindow {
    language: Pick<LanguageConfig, 'locale' | 'locales' | 'translations'>;
}

export function isLanguageWindow(window: Window | LanguageWindow): window is LanguageWindow {
    return 'language' in window && typeof window.language === 'object';
}
