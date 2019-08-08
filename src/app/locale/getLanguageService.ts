import { createLanguageService, LanguageService } from '@bigcommerce/checkout-sdk';

import defaultTranslations from '../language/en.json';

export default function getLanguageService(): LanguageService {
    return createLanguageService({ ...(window as any).language, defaultTranslations });
}
