import { createCheckoutService, createLanguageService } from '@bigcommerce/checkout-sdk';
import { createApplePayCustomerStrategy } from '@bigcommerce/checkout-sdk/integrations/apple-pay';
import React from 'react';

import { type CheckoutButtonProps } from '@bigcommerce/checkout/payment-integration-api';
import { render } from '@bigcommerce/checkout/test-utils';
import { navigateToOrderConfirmation } from '@bigcommerce/checkout/utility';

import ApplePayButton from './ApplePayButton';

jest.mock('@bigcommerce/checkout/utility', () => ({
    navigateToOrderConfirmation: jest.fn(),
}));

jest.mock('@bigcommerce/checkout/checkout-button-integration', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    CheckoutButton: jest.fn(() => <div id="mocked-checkout-button" />),
}));

// Get the mocked function reference
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const { CheckoutButton: mockCheckoutButton } = jest.requireMock(
    '@bigcommerce/checkout/checkout-button-integration',
);

describe('ApplePayButton', () => {
    let defaultProps: CheckoutButtonProps;

    beforeEach(() => {
        const checkoutService = createCheckoutService();

        defaultProps = {
            checkoutService,
            checkoutState: checkoutService.getState(),
            containerId: 'applepayCheckoutButton',
            language: createLanguageService(),
            methodId: 'applepay',
            onUnhandledError: jest.fn(),
            onWalletButtonClick: jest.fn(),
        };

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        mockCheckoutButton.mockClear();
    });

    it('renders ApplePayButton container', () => {
        render(<ApplePayButton {...defaultProps} />);

        expect(document.querySelector('#mocked-checkout-button')).toBeInTheDocument();
    });

    it('renders CheckoutButton with provided props and Apple Pay specific options', () => {
        render(<ApplePayButton {...defaultProps} />);

        expect(mockCheckoutButton).toHaveBeenCalledWith(
            expect.objectContaining({
                ...defaultProps,
                integrations: [createApplePayCustomerStrategy],
                additionalInitializationOptions: {
                    shippingLabel: defaultProps.language.translate('cart.shipping_text'),
                    subtotalLabel: defaultProps.language.translate('cart.subtotal_text'),
                    onPaymentAuthorize: navigateToOrderConfirmation,
                    onError: defaultProps.onUnhandledError,
                },
            }),
            {},
        );
    });
});
