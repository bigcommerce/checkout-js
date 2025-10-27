import { type LanguageService } from '@bigcommerce/checkout-sdk';

import { LocaleContext } from '@bigcommerce/checkout/contexts';
import { createInjectHoc, type InjectHoc } from '@bigcommerce/checkout/legacy-hoc';

export interface WithLanguageProps {
    language: LanguageService;
}

const withLanguage: InjectHoc<WithLanguageProps> = createInjectHoc(LocaleContext, {
    displayNamePrefix: 'WithLanguage',
    pickProps: (value, key) => key === 'language' && !!value,
});

export default withLanguage;
