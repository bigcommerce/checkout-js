import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { type FunctionComponent } from 'react';

import {
    CheckoutProvider,
    defaultCapabilities,
    LocaleProvider,
} from '@bigcommerce/checkout/contexts';
import { getLanguageService } from '@bigcommerce/checkout/locale';
import { type CheckoutButtonProps } from '@bigcommerce/checkout/payment-integration-api';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getStoreConfig } from '../config/config.mock';

import CheckoutButtonContainer from './CheckoutButtonContainer';
import { getCustomer, getGuestCustomer } from './customers.mock';

const MockCheckoutButton: FunctionComponent<CheckoutButtonProps> = ({ containerId }) => (
    <div data-test={containerId} />
);

jest.mock('./resolveCheckoutButton', () => ({
    __esModule: true,
    default: jest.fn(() => MockCheckoutButton),
}));

describe('CheckoutButtonContainer', () => {
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;

    const renderCheckoutButtonContainer = (isPaymentStepActive = false) =>
        render(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleProvider
                    checkoutService={checkoutService}
                    languageService={getLanguageService()}
                >
                    <CheckoutButtonContainer
                        checkEmbeddedSupport={noop}
                        isPaymentStepActive={isPaymentStepActive}
                        onUnhandledError={noop}
                        onWalletButtonClick={noop}
                    />
                </LocaleProvider>
            </CheckoutProvider>,
        );

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue({
            ...getStoreConfig(),
            checkoutSettings: {
                ...getStoreConfig().checkoutSettings,
                remoteCheckoutProviders: ['applepay'],
            },
        });

        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(true);
        jest.spyOn(checkoutState.data, 'getPaymentMethods').mockReturnValue([]);
        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getGuestCustomer());
    });

    it('renders wallet buttons for a signed-in customer when the experiment is enabled', async () => {
        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());
        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue({
            ...getStoreConfig(),
            checkoutSettings: {
                ...getStoreConfig().checkoutSettings,
                remoteCheckoutProviders: ['applepay'],
                features: {
                    'CHECKOUT-10028.wallet_buttons_for_logged_in_shoppers': true,
                },
            },
        });

        renderCheckoutButtonContainer();

        expect(await screen.findByTestId('applepayCheckoutButton')).toBeInTheDocument();
    });

    it('does not render for a signed-in customer when the experiment is disabled', () => {
        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());

        const { container } = renderCheckoutButtonContainer();

        expect(container).toBeEmptyDOMElement();
    });

    it('still renders wallet buttons for a guest customer', async () => {
        renderCheckoutButtonContainer();

        expect(await screen.findByTestId('applepayCheckoutButton')).toBeInTheDocument();
    });

    it('does not render when the store has no supported wallet providers configured', () => {
        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue({
            ...getStoreConfig(),
            checkoutSettings: {
                ...getStoreConfig().checkoutSettings,
                remoteCheckoutProviders: [],
            },
        });

        const { container } = renderCheckoutButtonContainer();

        expect(container).toBeEmptyDOMElement();
    });

    it('does not render when payment data is not required', () => {
        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(false);

        const { container } = renderCheckoutButtonContainer();

        expect(container).toBeEmptyDOMElement();
    });

    it('does not render for a B2B customer', () => {
        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());
        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue({
            ...getStoreConfig(),
            checkoutSettings: {
                ...getStoreConfig().checkoutSettings,
                remoteCheckoutProviders: ['applepay'],
                features: {
                    'CHECKOUT-10028.wallet_buttons_for_logged_in_shoppers': true,
                },
                capabilities: {
                    ...defaultCapabilities,
                    userJourney: {
                        ...defaultCapabilities.userJourney,
                        requiresB2BToken: true,
                    },
                },
            },
        });

        const { container } = renderCheckoutButtonContainer();

        expect(container).toBeEmptyDOMElement();
    });
});
