import { createLanguageService, LanguageService } from '@bigcommerce/checkout-sdk';

import { memoize } from '../common/utility';
import defaultTranslations from '../language/en.json';

function getLanguageService(): LanguageService {
    return createLanguageService({
        ...(window as any).language,
        defaultTranslations,
    });
}

export default memoize(getLanguageService, { maxSize: 0 });
