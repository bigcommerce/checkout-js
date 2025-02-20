import { createCheckoutService, createLanguageService } from '@bigcommerce/checkout-sdk';
import { render } from '@testing-library/react';
import React from 'react';

import { CheckoutButtonProps, isEmbedded } from '@bigcommerce/checkout/payment-integration-api';

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

    it('delegates to default checkout button if checkout is not embedded', () => {
        const { container } = render(<GooglePayButton {...defaultProps} />);

        expect(container.querySelector('#button-container')).toBeInTheDocument();
    });

    it('calls error callback if checkout is embedded', () => {
        (isEmbedded as jest.Mock).mockReturnValue(true);

        render(<GooglePayButton {...defaultProps} />);

        expect(defaultProps.onUnhandledError).toHaveBeenCalled();
    });
});
