import { LanguageService } from '@bigcommerce/checkout-sdk';

import LocaleContext from './LocaleContext';
import { createInjectHoc, InjectHoc } from '@bigcommerce/checkout/legacy-hoc';

export interface WithLanguageProps {
    language: LanguageService;
}

const withLanguage: InjectHoc<WithLanguageProps> = createInjectHoc(LocaleContext, {
    displayNamePrefix: 'WithLanguage',
    pickProps: (value, key) => key === 'language' && !!value,
});

export default withLanguage;
