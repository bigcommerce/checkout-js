import { createCurrencyService, StoreConfig } from '@bigcommerce/checkout-sdk';

import getLanguageService from './getLanguageService';
import { LocaleContextType } from './LocaleContext';

export default function createLocaleContext(config: StoreConfig): Required<LocaleContextType> {
    if (!config) {
        throw new Error('Missing configuration data');
    }

    return {
        currency: createCurrencyService(config),
        language: getLanguageService(),
    };
}
