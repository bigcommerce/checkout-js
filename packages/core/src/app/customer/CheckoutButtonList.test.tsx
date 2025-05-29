import { noop } from 'lodash';
import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getStoreConfig } from '../config/config.mock';

import CheckoutButtonList from './CheckoutButtonList';

describe('CheckoutButtonList', () => {
    const checkoutSettings = getStoreConfig().checkoutSettings;

    it('filters out unsupported methods', () => {
        render(
            <CheckoutButtonList
                checkoutSettings={checkoutSettings}
                deinitialize={noop}
                initialize={noop}
                methodIds={['applepay', 'amazonpay', 'braintreevisacheckout']}
            />,
        );

        expect(screen.getAllByRole('generic')).toHaveLength(6);
    });

    it('does not crash when no methods are passed', () => {
        render(
            <CheckoutButtonList
                checkoutSettings={checkoutSettings}
                deinitialize={noop}
                initialize={noop}
            />,
        );

        expect(screen.queryByText('Or continue with')).not.toBeInTheDocument();
    });

    it('does not render if there are no supported methods', () => {
        render(
            <CheckoutButtonList
                checkoutSettings={checkoutSettings}
                deinitialize={noop}
                initialize={noop}
                methodIds={['foobar']}
            />,
        );

        expect(screen.queryByText('Or continue with')).not.toBeInTheDocument();
    });

    it('does not render the translated string when initializing', () => {
        render(
            <CheckoutButtonList
                checkoutSettings={checkoutSettings}
                deinitialize={noop}
                initialize={noop}
                isInitializing={true}
                methodIds={['amazonpay', 'braintreevisacheckout']}
            />,
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
            <CheckoutButtonList
                checkEmbeddedSupport={checkEmbeddedSupport}
                checkoutSettings={checkoutSettings}
                deinitialize={noop}
                initialize={noop}
                methodIds={methodIds}
                onError={onError}
            />,
        );

        expect(checkEmbeddedSupport).toHaveBeenCalledWith(methodIds);

        expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    describe('when PAYPAL-5502.update_wallet_buttons_implementation_in_customer_step experiment is enabled', () => {
        const checkoutSettingsWithExperimentEnabled = {
            ...checkoutSettings,
            features: {
                ...checkoutSettings.features,
                'PAYPAL-5502.update_wallet_buttons_implementation_in_customer_step': true,
            },
        };

        it('filters out unsupported methods', () => {
            render(
                <CheckoutButtonList
                    checkoutSettings={checkoutSettingsWithExperimentEnabled}
                    deinitialize={noop}
                    initialize={noop}
                    methodIds={['applepay', 'amazonpay', 'braintreevisacheckout']}
                />,
            );

            expect(screen.getAllByRole('generic')).toHaveLength(6);
        });

        it('does not crash when no methods are passed', () => {
            render(
                <CheckoutButtonList
                    checkoutSettings={checkoutSettingsWithExperimentEnabled}
                    deinitialize={noop}
                    initialize={noop}
                />,
            );

            expect(screen.queryByText('Or continue with')).not.toBeInTheDocument();
        });

        it('does not render if there are no supported methods', () => {
            render(
                <CheckoutButtonList
                    checkoutSettings={checkoutSettingsWithExperimentEnabled}
                    deinitialize={noop}
                    initialize={noop}
                    methodIds={['foobar']}
                />,
            );

            expect(screen.queryByText('Or continue with')).not.toBeInTheDocument();
        });

        it('does not render the translated string when initializing', () => {
            render(
                <CheckoutButtonList
                    checkoutSettings={checkoutSettingsWithExperimentEnabled}
                    deinitialize={noop}
                    initialize={noop}
                    isInitializing={true}
                    methodIds={['amazonpay', 'braintreevisacheckout']}
                />,
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
                <CheckoutButtonList
                    checkEmbeddedSupport={checkEmbeddedSupport}
                    checkoutSettings={checkoutSettingsWithExperimentEnabled}
                    deinitialize={noop}
                    initialize={noop}
                    methodIds={methodIds}
                    onError={onError}
                />,
            );

            expect(checkEmbeddedSupport).toHaveBeenCalledWith(methodIds);

            expect(onError).toHaveBeenCalledWith(expect.any(Error));
        });
    });
});
