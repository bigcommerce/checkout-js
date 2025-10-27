import { createCurrencyService, type StoreConfig } from '@bigcommerce/checkout-sdk/essential';

import { type LocaleContextType } from '@bigcommerce/checkout/contexts';

import { getLanguageService } from './index';

export default function createLocaleContext(config?: StoreConfig): Required<LocaleContextType> {
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
