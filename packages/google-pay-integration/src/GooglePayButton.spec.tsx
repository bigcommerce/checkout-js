import { createCheckoutService, createLanguageService } from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import React from 'react';

import { CheckoutButton } from '@bigcommerce/checkout/checkout-button-integration';
import { CheckoutButtonProps, isEmbedded } from '@bigcommerce/checkout/payment-integration-api';

import GooglePayButton from './GooglePayButton';

jest.mock('@bigcommerce/checkout/payment-integration-api', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
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
        };
    });

    it('delegates to default checkout button if checkout is not embedded', () => {
        const component = mount(<GooglePayButton {...defaultProps} />);

        expect(component.find(CheckoutButton)).toHaveLength(1);
    });

    it('calls error callback if checkout is embedded', () => {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        (isEmbedded as jest.Mock).mockReturnValue(true);

        mount(<GooglePayButton {...defaultProps} />);

        expect(defaultProps.onUnhandledError).toHaveBeenCalled();
    });
});
