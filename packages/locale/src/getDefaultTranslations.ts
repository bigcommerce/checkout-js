import { Translations } from '@bigcommerce/checkout-sdk';

import { FALLBACK_TRANSLATIONS } from './translations';

const AVAILABLE_TRANSLATIONS: Record<string, () => Promise<{ default: unknown }>> = {
    es: () =>
        import(
            /* webpackChunkName: "translations-es" */
            './translations/es.json'
        ),
    'es-419': () =>
        import(
            /* webpackChunkName: "translations-es-419" */
            './translations/es-419.json'
        ),
    'es-AR': () =>
        import(
            /* webpackChunkName: "translations-es-ar" */
            './translations/es-AR.json'
        ),
    'es-CL': () =>
        import(
            /* webpackChunkName: "translations-es-cl" */
            './translations/es-CL.json'
        ),
    'es-CO': () =>
        import(
            /* webpackChunkName: "translations-es-co" */
            './translations/es-CO.json'
        ),
    'es-MX': () =>
        import(
            /* webpackChunkName: "translations-es-mx" */
            './translations/es-MX.json'
        ),
    'es-PE': () =>
        import(
            /* webpackChunkName: "translations-es-pe" */
            './translations/es-PE.json'
        ),
    da: () =>
        import(
            /* webpackChunkName: "translations-da" */
            './translations/da.json'
        ),
    de: () =>
        import(
            /* webpackChunkName: "translations-de" */
            './translations/de.json'
        ),
    fr: () =>
        import(
            /* webpackChunkName: "translations-fr" */
            './translations/fr.json'
        ),
    it: () =>
        import(
            /* webpackChunkName: "translations-it" */
            './translations/it.json'
        ),
    nl: () =>
        import(
            /* webpackChunkName: "translations-nl" */
            './translations/nl.json'
        ),
    no: () =>
        import(
            /* webpackChunkName: "translations-no" */
            './translations/no.json'
        ),
    'pt-BR': () =>
        import(
            /* webpackChunkName: "translations-pt-br" */
            './translations/pt-BR.json'
        ),
    pt: () =>
        import(
            /* webpackChunkName: "translations-pt" */
            './translations/pt.json'
        ),
    sv: () =>
        import(
            /* webpackChunkName: "translations-sv" */
            './translations/sv.json'
        ),
    pl: () =>
        import(
            /* webpackChunkName: "translations-sv" */
            './translations/pl.json'
        ),
    en: () => Promise.resolve({ default: FALLBACK_TRANSLATIONS }),
};

export default async function getDefaultTranslations(
    requestedLocale: string,
): Promise<Translations> {
    const loadTranslations =
        AVAILABLE_TRANSLATIONS[requestedLocale] ??
        AVAILABLE_TRANSLATIONS[requestedLocale.split('-')[0]];

    return loadTranslations ? asTranslations((await loadTranslations()).default) : {};
}

function asTranslations(translations: unknown): Translations {
    return isTranslations(translations) ? translations : {};
}

function isTranslations(translations: unknown): translations is Translations {
    return typeof translations === 'object';
}
