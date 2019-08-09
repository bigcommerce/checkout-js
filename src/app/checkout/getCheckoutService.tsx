import { createCheckoutService, createLanguageService } from '@bigcommerce/checkout-sdk';

import defaultTranslations from '../language/en.json';

const languageService = createLanguageService({
    ...(window as any).language,
    defaultTranslations,
});

export default () => createCheckoutService({
    locale: languageService.getLocale(),
    shouldWarnMutation: false,
});
