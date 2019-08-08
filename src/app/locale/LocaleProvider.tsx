import { createCurrencyService, CheckoutService, LanguageService, StoreConfig } from '@bigcommerce/checkout-sdk';
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
    state: Readonly<LocaleProviderState>;

    private languageService: LanguageService;
    private unsubscribe?: () => void;

    constructor(props: Readonly<LocaleProviderProps>) {
        super(props);

        this.state = {};
        this.languageService = getLanguageService();
    }

    componentDidMount(): void {
        const { checkoutService } = this.props;

        this.unsubscribe = checkoutService.subscribe(
            ({ data }) => {
                this.setState({ config: data.getConfig() });
            },
            ({ data }) => data.getConfig()
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
        const context = {
            currency: config ? createCurrencyService(config) : undefined,
            language: this.languageService,
        };

        return (
            <LocaleContext.Provider value={ context }>
                { children }
            </LocaleContext.Provider>
        );
    }
}

export default LocaleProvider;
