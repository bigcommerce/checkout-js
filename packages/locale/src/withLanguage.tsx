import { type LanguageService } from '@bigcommerce/checkout-sdk';

import { createInjectHoc, type InjectHoc } from '@bigcommerce/checkout/legacy-hoc';

import LocaleContext from './LocaleContext';

export interface WithLanguageProps {
    language: LanguageService;
}

const withLanguage: InjectHoc<WithLanguageProps> = createInjectHoc(LocaleContext, {
    displayNamePrefix: 'WithLanguage',
    pickProps: (value, key) => key === 'language' && !!value,
});

export default withLanguage;
