import { createCheckoutService, createLanguageService } from '@bigcommerce/checkout-sdk';
import { render } from '@testing-library/react';
import React from 'react';

import '@testing-library/jest-dom';
import { type CheckoutButtonProps } from '@bigcommerce/checkout/payment-integration-api';

import AmazonPayV2Button from './AmazonPayV2Button';

describe('AmazonPayV2Button', () => {
    let defaultProps: CheckoutButtonProps;

    beforeEach(() => {
        const checkoutService = createCheckoutService();

        defaultProps = {
            checkoutService,
            checkoutState: checkoutService.getState(),
            checkoutButtonContainerClass: 'checkoutButtonContainerClass',
            containerId: 'button-container',
            language: createLanguageService(),
            methodId: 'amazonpay',
            onUnhandledError: jest.fn(),
            onWalletButtonClick: jest.fn(),
        };
    });

    it('renders as CheckoutButton', () => {
        const { container } = render(<AmazonPayV2Button {...defaultProps} />);

        expect(container.getElementsByClassName('checkoutButtonContainerClass')).toHaveLength(1);
    });
});
