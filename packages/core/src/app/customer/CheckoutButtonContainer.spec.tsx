import { CheckoutSelectors, CheckoutService, createCheckoutService } from '@bigcommerce/checkout-sdk';
import { render } from 'enzyme';
import { merge } from 'lodash';
import React from 'react';

import CheckoutProvider from '../checkout/CheckoutProvider';
import { getStoreConfig } from '../config/config.mock';
import { createLocaleContext, LocaleContext, LocaleContextType, } from '../locale';

import CheckoutButtonContainer from './CheckoutButtonContainer';

describe('CheckoutButtonContainer', () => {
    let localeContext: LocaleContextType;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        localeContext = createLocaleContext(getStoreConfig());

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(
            merge(getStoreConfig(), {
                checkoutSettings: {
                    features: { 'CHECKOUT-7222.checkout_settings_styling_section': true },
                    remoteCheckoutProviders: ['amazonpay','applepay', 'braintreevisacheckout'],
                },
            }),
        );
    });

    it('matches snapshot', () => {
        const component = render(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <CheckoutButtonContainer
                        checkEmbeddedSupport={jest.fn()}
                        onUnhandledError={jest.fn()}
                    />
                </LocaleContext.Provider>
            </CheckoutProvider>
        );

        expect(component).toMatchSnapshot();
    });
});
