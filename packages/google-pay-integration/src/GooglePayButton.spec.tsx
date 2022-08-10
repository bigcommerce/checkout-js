import { CheckoutButton } from '@bigcommerce/checkout-js/checkout-button-integration';
import { CheckoutButtonProps, isEmbedded } from '@bigcommerce/checkout-js/payment-integration-api';
import { createCheckoutService, createLanguageService } from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import React from 'react';

import GooglePayButton from './GooglePayButton';

jest.mock('@bigcommerce/checkout-js/payment-integration-api', () => {
    return {
        ...jest.requireActual('@bigcommerce/checkout-js/payment-integration-api'),
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
        };
    });

    it('delegates to default checkout button if checkout is not embedded', () => {
        const component = mount(<GooglePayButton { ...defaultProps } />);

        expect(component.find(CheckoutButton).length)
            .toEqual(1);
    });

    it('calls error callback if checkout is embedded', () => {
        (isEmbedded as jest.Mock).mockReturnValue(true);

        mount(<GooglePayButton { ...defaultProps } />);

        expect(defaultProps.onUnhandledError)
            .toHaveBeenCalled();
    });
});
