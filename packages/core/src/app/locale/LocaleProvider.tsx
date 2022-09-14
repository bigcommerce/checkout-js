import { CheckoutService, createCurrencyService, StoreConfig } from '@bigcommerce/checkout-sdk';
import { memoizeOne } from '@bigcommerce/memoize';
import React, { Component, ReactNode } from 'react';

import getLanguageService from './getLanguageService';
import LocaleContext from './LocaleContext';

export interface LocaleProviderProps {
    checkoutService: CheckoutService;
}

export interface LocaleProviderState {
    config?: StoreConfig;
}

class LocaleProvider extends Component<LocaleProviderProps> {
    state: Readonly<LocaleProviderState> = {};

    private languageService = getLanguageService();
    private unsubscribe?: () => void;

    private getContextValue = memoizeOne((config?: StoreConfig) => {
        return {
            currency: config ? createCurrencyService(config) : undefined,
            date: config
                ? {
                      inputFormat: config.inputDateFormat,
                  }
                : undefined,
            language: this.languageService,
        };
    });

    componentDidMount(): void {
        const { checkoutService } = this.props;

        this.unsubscribe = checkoutService.subscribe(
            ({ data }) => {
                this.setState({ config: data.getConfig() });
            },
            ({ data }) => data.getConfig(),
        );
    }

    componentWillUnmount(): void {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = undefined;
        }
    }

    render(): ReactNode {
        const { children } = this.props;
        const { config } = this.state;

        return (
            <LocaleContext.Provider value={this.getContextValue(config)}>
                {children}
            </LocaleContext.Provider>
        );
    }
}

export default LocaleProvider;
