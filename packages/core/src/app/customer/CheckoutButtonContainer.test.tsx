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
    let CheckoutButtonContainerTest: FunctionComponent<{ isPaymentStepActive?: boolean }>;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;

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

        CheckoutButtonContainerTest = ({ isPaymentStepActive = false }) => (
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
            </CheckoutProvider>
        );
    });

    it('renders wallet buttons for a signed-in customer', async () => {
        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());

        render(<CheckoutButtonContainerTest />);

        expect(await screen.findByTestId('applepayCheckoutButton')).toBeInTheDocument();
    });

    it('still renders wallet buttons for a guest customer', async () => {
        render(<CheckoutButtonContainerTest />);

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

        const { container } = render(<CheckoutButtonContainerTest />);

        expect(container).toBeEmptyDOMElement();
    });

    it('does not render when payment data is not required', () => {
        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(false);

        const { container } = render(<CheckoutButtonContainerTest />);

        expect(container).toBeEmptyDOMElement();
    });

    it('does not render for a B2B customer', () => {
        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());
        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue({
            ...getStoreConfig(),
            checkoutSettings: {
                ...getStoreConfig().checkoutSettings,
                remoteCheckoutProviders: ['applepay'],
                capabilities: {
                    ...defaultCapabilities,
                    userJourney: {
                        ...defaultCapabilities.userJourney,
                        requiresB2BToken: true,
                    },
                },
            },
        });

        const { container } = render(<CheckoutButtonContainerTest />);

        expect(container).toBeEmptyDOMElement();
    });
});
