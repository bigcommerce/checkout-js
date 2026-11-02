import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
    type PaymentMethod,
} from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React from 'react';

import { CheckoutProvider, defaultCapabilities } from '@bigcommerce/checkout/contexts';
import { getPaymentMethod } from '@bigcommerce/checkout/test-mocks';
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

    const createWalletMethod = (
        id: string,
        method: string,
        shouldVaultAllPayments: boolean,
    ): PaymentMethod => ({
        ...getPaymentMethod(),
        id,
        method,
        config: { ...getPaymentMethod().config, displayName: '', shouldVaultAllPayments },
    });

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

    it('renders one disclaimer naming every rendered auto-vaulting wallet', async () => {
        jest.spyOn(checkoutService, 'getState').mockReturnValue(checkoutState);
        jest.spyOn(checkoutState.data, 'getPaymentMethods').mockReturnValue([
            createWalletMethod('applepay', 'credit-card', true),
            createWalletMethod('googlepaystripeocs', 'googlepay', true),
        ]);

        renderCheckoutButtonList({ methodIds: ['applepay', 'googlepaystripeocs'] });

        expect(await screen.findByTestId('auto-vaulting-disclaimer')).toBeInTheDocument();
        expect(screen.getByTestId('auto-vaulting-disclaimer')).toHaveTextContent(
            'By paying with Apple Pay or Google Pay, you agree the merchant may charge your card for future payments under its terms.',
        );
    });

    it('does not render the disclaimer when no rendered wallet auto-vaults', async () => {
        jest.spyOn(checkoutService, 'getState').mockReturnValue(checkoutState);
        jest.spyOn(checkoutState.data, 'getPaymentMethods').mockReturnValue([
            createWalletMethod('applepay', 'credit-card', false),
            createWalletMethod('googlepaystripeocs', 'googlepay', true),
        ]);

        renderCheckoutButtonList({ methodIds: ['applepay'] });

        expect(await screen.findByTestId('applepayCheckoutButton')).toBeInTheDocument();
        expect(screen.queryByTestId('auto-vaulting-disclaimer')).not.toBeInTheDocument();
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
