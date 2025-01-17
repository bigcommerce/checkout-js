import { createCheckoutService, createLanguageService } from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import React from 'react';

import { CheckoutButton } from '@bigcommerce/checkout/checkout-button-integration';
import { CheckoutButtonProps } from '@bigcommerce/checkout/payment-integration-api';

import GooglePayButton from './GooglePayButton';

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

    it('delegates to default checkout button', () => {
        const component = mount(<GooglePayButton {...defaultProps} />);

        expect(component.find(CheckoutButton)).toHaveLength(1);
    });
});
