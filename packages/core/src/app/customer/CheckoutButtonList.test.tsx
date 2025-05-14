import { noop } from 'lodash';
import React from 'react';

import { render, screen } from '@testing-library/react';

import { getStoreConfig } from '../config/config.mock';

import CheckoutButtonList from './CheckoutButtonList';
import { createCheckoutService } from '@bigcommerce/checkout-sdk';
import { createLocaleContext, LocaleContext } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';

describe('CheckoutButtonList', () => {
    const checkoutSettings = getStoreConfig().checkoutSettings;

    it('filters out unsupported methods', () => {
        render(
            <CheckoutProvider checkoutService={createCheckoutService()}>
                <LocaleContext.Provider value={createLocaleContext(getStoreConfig())}>
                    <CheckoutButtonList
                        checkoutSettings={checkoutSettings}
                        deinitialize={noop}
                        initialize={noop}
                        methodIds={['amazonpay', 'braintreevisacheckout', 'paypalcommerce']}
                    />
                </LocaleContext.Provider>
            </CheckoutProvider>,
        );

        expect(screen.getAllByRole('generic')).toHaveLength(6);
    });

    it('does not crash when no methods are passed', () => {
        render(
            <CheckoutProvider checkoutService={createCheckoutService()}>
                <LocaleContext.Provider value={createLocaleContext(getStoreConfig())}>
                    <CheckoutButtonList
                        checkoutSettings={checkoutSettings}
                        deinitialize={noop}
                        initialize={noop}
                    />
                </LocaleContext.Provider>
            </CheckoutProvider>,
        );

        expect(screen.queryByText('Or continue with')).not.toBeInTheDocument();
    });

    it('does not render if there are no supported methods', () => {
        render(
            <CheckoutProvider checkoutService={createCheckoutService()}>
                <LocaleContext.Provider value={createLocaleContext(getStoreConfig())}>
                    <CheckoutButtonList
                        checkoutSettings={checkoutSettings}
                        deinitialize={noop}
                        initialize={noop}
                        methodIds={['foobar']}
                    />
                </LocaleContext.Provider>
            </CheckoutProvider>,
        );

        expect(screen.queryByText('Or continue with')).not.toBeInTheDocument();
    });

    it('does not render the translated string when initializing', () => {
        render(
            <CheckoutProvider checkoutService={createCheckoutService()}>
                <LocaleContext.Provider value={createLocaleContext(getStoreConfig())}>
                    <CheckoutButtonList
                        checkoutSettings={checkoutSettings}
                        deinitialize={noop}
                        initialize={noop}
                        isInitializing={true}
                        methodIds={['amazonpay', 'braintreevisacheckout']}
                    />
                </LocaleContext.Provider>
            </CheckoutProvider>,
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
            <CheckoutProvider checkoutService={createCheckoutService()}>
                <LocaleContext.Provider value={createLocaleContext(getStoreConfig())}>
                    <CheckoutButtonList
                        checkEmbeddedSupport={checkEmbeddedSupport}
                        checkoutSettings={checkoutSettings}
                        deinitialize={noop}
                        initialize={noop}
                        methodIds={methodIds}
                        onError={onError}
                    />
                </LocaleContext.Provider>
            </CheckoutProvider>,
        );

        expect(checkEmbeddedSupport).toHaveBeenCalledWith(methodIds);

        expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
});
