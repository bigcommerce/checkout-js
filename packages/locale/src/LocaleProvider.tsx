import { CheckoutService, createCurrencyService, StoreConfig } from '@bigcommerce/checkout-sdk';
import { memoizeOne } from '@bigcommerce/memoize';
import React, { ReactNode, useEffect, useMemo, useState } from 'react';

import getLanguageService from './getLanguageService';
import LocaleContext from './LocaleContext';

export interface LocaleProviderProps {
    checkoutService: CheckoutService;
    children?: ReactNode;
}

const LocaleProvider: React.FC<LocaleProviderProps> = ({ checkoutService, children }) => {
    const [config, setConfig] = useState<StoreConfig | undefined>();
    const languageService = useMemo(() => getLanguageService(), []);

    const getContextValue = memoizeOne((storeConfig?: StoreConfig) => {
        return {
            currency: storeConfig ? createCurrencyService(storeConfig) : undefined,
            date: storeConfig
                ? {
                      inputFormat: storeConfig.inputDateFormat,
                  }
                : undefined,
            language: languageService,
        };
    });

    useEffect(() => {
        const unsubscribe = checkoutService.subscribe(
            ({ data }) => {
                setConfig(data.getConfig());
            },
            ({ data }) => data.getConfig(),
        );

        return () => {
            unsubscribe();
        };
    }, [checkoutService]);

    const contextValue = useMemo(() => getContextValue(config), [config, getContextValue]);

    return <LocaleContext.Provider value={contextValue}>{children}</LocaleContext.Provider>;
};

export default LocaleProvider;
