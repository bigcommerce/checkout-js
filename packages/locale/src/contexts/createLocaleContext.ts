import {
    createCurrencyService,
    createLanguageService,
    StoreConfig,
} from '@bigcommerce/checkout-sdk';

import { LocaleContextType } from './LocaleContext';

export default function createLocaleContext(config: StoreConfig): Required<LocaleContextType> {
    const { inputDateFormat } = config;

    return {
        currency: createCurrencyService(config),
        date: {
            inputFormat: inputDateFormat,
        },
        language: createLanguageService(),
    };
}
