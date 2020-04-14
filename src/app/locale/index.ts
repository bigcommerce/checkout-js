import { WithCurrencyProps } from './withCurrency';
import { WithLanguageProps } from './withLanguage';
import { LocaleContextType } from './LocaleContext';
import { TranslatedHtmlProps } from './TranslatedHtml';
import { TranslatedLinkProps } from './TranslatedLink';
import { TranslatedStringProps } from './TranslatedString';

export type LocaleContextType = LocaleContextType;
export type WithCurrencyProps = WithCurrencyProps;
export type WithLanguageProps = WithLanguageProps;
export type TranslatedHtmlProps = TranslatedHtmlProps;
export type TranslatedStringProps = TranslatedStringProps;
export type TranslatedLinkProps = TranslatedLinkProps;

export { default as LocaleContext } from './LocaleContext';
export { default as createLocaleContext } from './createLocaleContext';
export { default as getLanguageService } from './getLanguageService';
export { default as withCurrency } from './withCurrency';
export { default as withLanguage } from './withLanguage';
export { default as LocaleProvider } from './LocaleProvider';
export { default as TranslatedHtml } from './TranslatedHtml';
export { default as TranslatedLink } from './TranslatedLink';
export { default as TranslatedString } from './TranslatedString';
