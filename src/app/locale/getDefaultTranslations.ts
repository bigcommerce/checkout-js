import { Translations } from '@bigcommerce/checkout-sdk';

import { FALLBACK_TRANSLATIONS } from './translations';

export default async function getDefaultTranslations(locale: string): Promise<Translations> {
    switch (locale) {
        case 'de':
            return asTranslations((await import(
                /* webpackChunkName: "translations-de" */
                './translations/de.json'
            )).default);

        case 'fr':
            return asTranslations((await import(
                /* webpackChunkName: "translations-fr" */
                './translations/fr.json'
            )).default);

        case 'it':
            return asTranslations((await import(
                /* webpackChunkName: "translations-it" */
                './translations/it.json'
            )).default);

        case 'nl':
            return asTranslations((await import(
                /* webpackChunkName: "translations-nl" */
                './translations/nl.json'
            )).default);

        case 'pt-BR':
            return asTranslations((await import(
                /* webpackChunkName: "translations-pt-br" */
                './translations/pt-BR.json'
            )).default);

        case 'pt':
            return asTranslations((await import(
                /* webpackChunkName: "translations-pt" */
                './translations/pt.json'
            )).default);

        case 'sv':
            return asTranslations((await import(
                /* webpackChunkName: "translations-sv" */
                './translations/sv.json'
            )).default);

        case 'en':
            return FALLBACK_TRANSLATIONS;

        default:
            return {};
    }
}

function asTranslations(translations: unknown): Translations {
    return isTranslations(translations) ? translations : {};
}

function isTranslations(translations: unknown): translations is Translations {
    return typeof translations === 'object';
}
