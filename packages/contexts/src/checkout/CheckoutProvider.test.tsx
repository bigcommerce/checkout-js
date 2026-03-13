import { createCheckoutService } from '@bigcommerce/checkout-sdk';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { getStoreConfig } from '@bigcommerce/checkout/test-mocks';

import { defaultCapabilities, useCapabilities } from '../capabilities';
import CheckoutProvider from './CheckoutProvider';

describe('CheckoutProvider', () => {
    it('subscribes to state changes when component is mounted', () => {
        const service = createCheckoutService();

        jest.spyOn(service, 'subscribe');

        render(
            <CheckoutProvider checkoutService={service}>
                <div />
            </CheckoutProvider>,
        );

        expect(service.subscribe).toHaveBeenCalled();
    });

    it('unsubscribes from state changes when component unmounts', () => {
        const service = createCheckoutService();
        const unsubscribe = jest.fn();

        jest.spyOn(service, 'subscribe').mockReturnValue(unsubscribe);

        const { unmount } = render(
            <CheckoutProvider checkoutService={service}>
                <div />
            </CheckoutProvider>,
        );

        unmount();

        expect(unsubscribe).toHaveBeenCalled();
    });

    it('provides context with defaultCapabilities when config has no capabilities', () => {
        const service = createCheckoutService();

        jest.spyOn(service.getState().data, 'getConfig').mockReturnValue(getStoreConfig());

        const Consumer = () => {
            const capabilities = useCapabilities();

            return (
                <span data-test="capabilities">
                    {capabilities.userJourney.hasCompanyAddressBook
                        ? 'has-companyAddressBook'
                        : 'no-companyAddressBook'}
                </span>
            );
        };

        render(
            <CheckoutProvider checkoutService={service}>
                <Consumer />
            </CheckoutProvider>,
        );

        expect(screen.getByTestId('capabilities')).toHaveTextContent('no-companyAddressBook');
    });

    it('provides context with config capabilities when checkoutSettings.capabilities is set', () => {
        const service = createCheckoutService();
        const configCapabilities = {
            ...defaultCapabilities,
            userJourney: {
                ...defaultCapabilities.userJourney,
                hasCompanyAddressBook: true,
            },
        };
        const config = {
            ...getStoreConfig(),
            checkoutSettings: {
                ...getStoreConfig().checkoutSettings,
                capabilities: configCapabilities,
            },
        };

        jest.spyOn(service.getState().data, 'getConfig').mockReturnValue(config);

        const Consumer = () => {
            const capabilities = useCapabilities();

            return (
                <span data-test="capabilities">
                    {capabilities.userJourney.hasCompanyAddressBook
                        ? 'has-companyAddressBook'
                        : 'no-companyAddressBook'}
                </span>
            );
        };

        render(
            <CheckoutProvider checkoutService={service}>
                <Consumer />
            </CheckoutProvider>,
        );

        expect(screen.getByTestId('capabilities')).toHaveTextContent('has-companyAddressBook');
    });
});
