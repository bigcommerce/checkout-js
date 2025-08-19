import { createCheckoutService, createLanguageService } from '@bigcommerce/checkout-sdk';
import React from 'react';

import {
    type CheckoutButtonProps,
    isEmbedded,
} from '@bigcommerce/checkout/payment-integration-api';
import { render } from '@bigcommerce/checkout/test-utils';

import GooglePayButton from './GooglePayButton';

jest.mock('@bigcommerce/checkout/payment-integration-api', () => {
    return {
        ...jest.requireActual('@bigcommerce/checkout/payment-integration-api'),
        isEmbedded: jest.fn(() => false),
    };
});

describe('GooglePayButton', () => {
    let defaultProps: CheckoutButtonProps;

    beforeEach(() => {
        const checkoutService = createCheckoutService();

        defaultProps = {
            checkoutService,
            checkoutState: checkoutService.getState(),
            containerId: 'button-container',
            language: createLanguageService(),
            methodId: 'googlepay',
            onUnhandledError: jest.fn(),
            onWalletButtonClick: jest.fn(),
        };
    });

    it('renders GooglePayButton when checkout is not embedded', () => {
        (isEmbedded as jest.Mock).mockReturnValue(false);

        const { container } = render(<GooglePayButton {...defaultProps} />);

        expect(container.querySelector('.google-pay-top-button')).toBeInTheDocument();
    });

    it('does not render GooglePayButton if checkout is embedded', () => {
        (isEmbedded as jest.Mock).mockReturnValue(true);

        const { container } = render(<GooglePayButton {...defaultProps} />);

        expect(container.querySelector('.google-pay-top-button')).not.toBeInTheDocument();
    });
});
