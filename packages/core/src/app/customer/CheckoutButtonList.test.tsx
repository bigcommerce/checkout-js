import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React from 'react';

import { CheckoutProvider, defaultCapabilities } from '@bigcommerce/checkout/contexts';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getStoreConfig } from '../config/config.mock';

import CheckoutButtonList, { type CheckoutButtonListProps } from './CheckoutButtonList';

describe('CheckoutButtonList', () => {
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;

    const renderCheckoutButtonList = (props: Partial<CheckoutButtonListProps> = {}) =>
        render(
            <CheckoutProvider checkoutService={checkoutService}>
                <CheckoutButtonList deinitialize={noop} initialize={noop} {...props} />
            </CheckoutProvider>,
        );

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());
    });

    it('filters out unsupported methods', async () => {
        renderCheckoutButtonList({
            methodIds: ['applepay', 'amazonpay', 'braintreevisacheckout'],
        });

        expect(await screen.findByTestId('applepayCheckoutButton')).toBeInTheDocument();
        expect(
            await screen.findByTestId('braintreevisacheckoutCheckoutButton'),
        ).toBeInTheDocument();
        expect(await screen.findByTestId('amazonpayCheckoutButton')).toBeInTheDocument();
    });

    it('does not crash when no methods are passed', () => {
        renderCheckoutButtonList();

        expect(screen.queryByText('Or continue with')).not.toBeInTheDocument();
    });

    it('does not render if there are no supported methods', () => {
        renderCheckoutButtonList({ methodIds: ['foobar'] });

        expect(screen.queryByText('Or continue with')).not.toBeInTheDocument();
    });

    it('does not render the translated string when initializing', () => {
        renderCheckoutButtonList({
            isInitializing: true,
            methodIds: ['amazonpay', 'braintreevisacheckout'],
        });

        expect(screen.queryByText('Or continue with')).not.toBeInTheDocument();
    });

    it('does not render wallet buttons when the disableWalletButtons capability is true', () => {
        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue({
            ...getStoreConfig(),
            checkoutSettings: {
                ...getStoreConfig().checkoutSettings,
                capabilities: {
                    ...defaultCapabilities,
                    userJourney: {
                        ...defaultCapabilities.userJourney,
                        disableWalletButtons: true,
                    },
                },
            },
        });

        const { container } = renderCheckoutButtonList({ methodIds: ['applepay'] });

        expect(container).toBeEmptyDOMElement();
    });

    it('renders wallet buttons when the disableWalletButtons capability is absent', async () => {
        renderCheckoutButtonList({ methodIds: ['applepay'] });

        expect(await screen.findByTestId('applepayCheckoutButton')).toBeInTheDocument();
    });

    it('notifies parent if methods are incompatible with Embedded Checkout', () => {
        const methodIds = ['amazonpay', 'braintreevisacheckout'];
        const onError = jest.fn();
        const checkEmbeddedSupport = jest.fn(() => {
            throw new Error();
        });

        renderCheckoutButtonList({
            checkEmbeddedSupport,
            methodIds,
            onError,
        });

        expect(checkEmbeddedSupport).toHaveBeenCalledWith(methodIds);

        expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
});
