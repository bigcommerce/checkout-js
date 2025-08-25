import { createCurrencyService, type StoreConfig } from '@bigcommerce/checkout-sdk';

import getLanguageService from './getLanguageService';
import { type LocaleContextType } from './LocaleContext';

export default function createLocaleContext(config: StoreConfig): Required<LocaleContextType> {
    if (!config) {
        throw new Error('Missing configuration data');
    }

    const { inputDateFormat } = config;

    return {
        currency: createCurrencyService(config),
        date: {
            inputFormat: inputDateFormat,
        },
        language: getLanguageService(),
    };
}
