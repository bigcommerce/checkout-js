import { noop } from 'lodash';
import React from 'react';

import {
    createLocaleContext,
    LocaleContext,
    LocaleContextType,
} from '@bigcommerce/checkout/locale';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getStoreConfig } from '../config/config.mock';

import CheckoutButtonList from './CheckoutButtonList';

describe('CheckoutButtonList', () => {
    let localeContext: LocaleContextType;

    const checkoutSettings = getStoreConfig().checkoutSettings;

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());
    });

    it('filters out unsupported methods', () => {
        // Apple Pay is supported across all browsers since 2025
        // no unsupported methods since then

        render(
            <LocaleContext.Provider value={localeContext}>
                <CheckoutButtonList
                    checkoutSettings={checkoutSettings}
                    deinitialize={noop}
                    initialize={noop}
                    methodIds={['applepay', 'amazonpay', 'braintreevisacheckout']}
                />
            </LocaleContext.Provider>,
        );

        expect(screen.getAllByRole('generic')).toHaveLength(6);
    });

    it('does not crash when no methods are passed', () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <CheckoutButtonList
                    checkoutSettings={checkoutSettings}
                    deinitialize={noop}
                    initialize={noop}
                />
            </LocaleContext.Provider>,
        );

        expect(screen.queryByText('Or continue with')).not.toBeInTheDocument();
    });

    it('does not render if there are no supported methods', () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <CheckoutButtonList
                    checkoutSettings={checkoutSettings}
                    deinitialize={noop}
                    initialize={noop}
                    methodIds={['foobar']}
                />
            </LocaleContext.Provider>,
        );

        expect(screen.queryByText('Or continue with')).not.toBeInTheDocument();
    });

    it('does not render the translated string when initializing', () => {
        render(
            <LocaleContext.Provider value={localeContext}>
                <CheckoutButtonList
                    checkoutSettings={checkoutSettings}
                    deinitialize={noop}
                    initialize={noop}
                    isInitializing={true}
                    methodIds={['amazonpay', 'braintreevisacheckout']}
                />
            </LocaleContext.Provider>,
        );

        expect(screen.queryByText('Or continue with')).not.toBeInTheDocument();
    });

    it('notifies parent if methods are incompatible with Embedded Checkout', () => {
        const methodIds = ['amazonpay', 'braintreevisacheckout'];
        const onError = jest.fn();
        const checkEmbeddedSupport = jest.fn(() => {
            throw new Error();
        });

        render(
            <LocaleContext.Provider value={localeContext}>
                <CheckoutButtonList
                    checkEmbeddedSupport={checkEmbeddedSupport}
                    checkoutSettings={checkoutSettings}
                    deinitialize={noop}
                    initialize={noop}
                    methodIds={methodIds}
                    onError={onError}
                />
            </LocaleContext.Provider>,
        );

        expect(checkEmbeddedSupport).toHaveBeenCalledWith(methodIds);

        expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
});
