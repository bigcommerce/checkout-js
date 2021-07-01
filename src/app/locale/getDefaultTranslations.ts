import { Translations } from '@bigcommerce/checkout-sdk';

import { FALLBACK_TRANSLATIONS } from './translations';

const AVAILABLE_TRANSLATIONS: Record<string, () => Promise<{ default: unknown }>> = {
    de: () => import(
        /* webpackChunkName: "translations-de" */
        './translations/de.json'
    ),
    fr: () => import(
        /* webpackChunkName: "translations-fr" */
        './translations/fr.json'
    ),
    it: () => import(
        /* webpackChunkName: "translations-it" */
        './translations/it.json'
    ),
    nl: () => import(
        /* webpackChunkName: "translations-nl" */
        './translations/nl.json'
    ),
    'pt-BR': () => import(
        /* webpackChunkName: "translations-pt-br" */
        './translations/pt-BR.json'
    ),
    pt: () => import(
        /* webpackChunkName: "translations-pt" */
        './translations/pt.json'
    ),
    sv: () => import(
        /* webpackChunkName: "translations-sv" */
        './translations/sv.json'
    ),
    en: () => Promise.resolve(({ default: FALLBACK_TRANSLATIONS })),
};

export default async function getDefaultTranslations(requestedLocale: string): Promise<Translations> {
    const loadTranslations = AVAILABLE_TRANSLATIONS[requestedLocale] ?? AVAILABLE_TRANSLATIONS[requestedLocale.split('-')[0]];

    return loadTranslations ? asTranslations((await loadTranslations()).default) : {};
}

function asTranslations(translations: unknown): Translations {
    return isTranslations(translations) ? translations : {};
}

function isTranslations(translations: unknown): translations is Translations {
    return typeof translations === 'object';
}
