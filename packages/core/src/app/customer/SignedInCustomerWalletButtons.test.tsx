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

import { getB2BCustomer, getCustomer, getGuestCustomer } from './customers.mock';
import { SignedInCustomerWalletButtons } from './SignedInCustomerWalletButtons';

const MockCheckoutButton: FunctionComponent<CheckoutButtonProps> = ({ containerId }) => (
    <div data-test={containerId} />
);

jest.mock('./resolveCheckoutButton', () => ({
    __esModule: true,
    default: jest.fn(() => MockCheckoutButton),
}));

describe('SignedInCustomerWalletButtons', () => {
    let SignedInCustomerWalletButtonsTest: FunctionComponent;
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
        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());

        SignedInCustomerWalletButtonsTest = () => (
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleProvider
                    checkoutService={checkoutService}
                    languageService={getLanguageService()}
                >
                    <SignedInCustomerWalletButtons
                        checkEmbeddedSupport={noop}
                        onUnhandledError={noop}
                        onWalletButtonClick={noop}
                    />
                </LocaleProvider>
            </CheckoutProvider>
        );
    });

    it('renders wallet buttons for a signed-in customer', async () => {
        render(<SignedInCustomerWalletButtonsTest />);

        expect(await screen.findByTestId('applepayCheckoutButton')).toBeInTheDocument();
    });

    it('does not render for a guest customer', () => {
        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getGuestCustomer());

        const { container } = render(<SignedInCustomerWalletButtonsTest />);

        expect(container).toBeEmptyDOMElement();
    });

    it('does not render for a B2B customer', () => {
        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getB2BCustomer());
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

        const { container } = render(<SignedInCustomerWalletButtonsTest />);

        expect(container).toBeEmptyDOMElement();
    });

    it('does not render when wallet buttons are shown on top', () => {
        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue({
            ...getStoreConfig(),
            checkoutSettings: {
                ...getStoreConfig().checkoutSettings,
                remoteCheckoutProviders: ['applepay'],
                checkoutUserExperienceSettings: {
                    ...getStoreConfig().checkoutSettings.checkoutUserExperienceSettings,
                    walletButtonsOnTop: true,
                },
            },
        });

        const { container } = render(<SignedInCustomerWalletButtonsTest />);

        expect(container).toBeEmptyDOMElement();
    });

    it('does not render when payment data is not required', () => {
        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(false);

        const { container } = render(<SignedInCustomerWalletButtonsTest />);

        expect(container).toBeEmptyDOMElement();
    });

    it('does not render any buttons when the store has no supported wallet providers configured', () => {
        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue({
            ...getStoreConfig(),
            checkoutSettings: {
                ...getStoreConfig().checkoutSettings,
                remoteCheckoutProviders: [],
            },
        });

        render(<SignedInCustomerWalletButtonsTest />);

        expect(screen.queryByTestId('applepayCheckoutButton')).not.toBeInTheDocument();
    });
});
