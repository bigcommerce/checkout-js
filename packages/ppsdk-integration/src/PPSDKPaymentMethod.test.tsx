import { createCheckoutService, createLanguageService } from '@bigcommerce/checkout-sdk';
import React from 'react';

import { type PaymentMethodProps } from '@bigcommerce/checkout/payment-integration-api';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import PPSDKPaymentMethod from './PPSDKPaymentMethod';

jest.mock('@bigcommerce/checkout/hosted-credit-card-integration', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    HostedCreditCardPaymentMethod: jest.fn(() => (
        <div data-test="hosted-credit-card-payment-method" />
    )),
}));

describe('PPSDKPaymentMethod', () => {
    let checkoutService: ReturnType<typeof createCheckoutService>;
    let defaultProps: PaymentMethodProps;

    beforeEach(() => {
        checkoutService = createCheckoutService();

        defaultProps = {
            method: {
                id: 'ppsdkProvider',
                logoUrl: '',
                method: 'ppsdk',
                supportedCards: [],
                config: {},
                type: 'PAYMENT_TYPE_SDK',
                skipRedirectConfirmationAlert: false,
            },
            checkoutService,
            checkoutState: checkoutService.getState(),
            paymentForm: jest.fn() as unknown as PaymentMethodProps['paymentForm'],
            language: createLanguageService(),
            onUnhandledError: jest.fn(),
        };
    });

    it('renders the credit card form when initialization strategy type is card UI', () => {
        const props = {
            ...defaultProps,
            method: {
                ...defaultProps.method,
                initializationStrategy: {
                    type: 'card_ui',
                },
            },
        };

        render(<PPSDKPaymentMethod {...props} />);

        expect(screen.getByTestId('hosted-credit-card-payment-method')).toBeInTheDocument();
    });

    it('renders nothing when the method is redirection', () => {
        const props = {
            ...defaultProps,
            method: {
                ...defaultProps.method,
                initializationStrategy: {
                    type: 'none',
                },
            },
        };

        const { container } = render(<PPSDKPaymentMethod {...props} />);

        expect(container).toBeEmptyDOMElement();
    });

    it('calls onUnhandledError when initialization strategy type is not found', () => {
        const onUnhandledError = jest.fn();
        const props = {
            ...defaultProps,
            onUnhandledError,
            method: {
                ...defaultProps.method,
                initializationStrategy: {
                    type: 'unknown_type',
                },
            },
        };

        render(<PPSDKPaymentMethod {...props} />);

        expect(onUnhandledError).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'PPSDK initialization strategy not found',
            }),
        );
    });
});
