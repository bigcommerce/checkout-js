import { CheckoutButtonProps } from '@bigcommerce/checkout/payment-integration-api';
import { createCheckoutService, createLanguageService } from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import React from 'react';

import CheckoutButton from './CheckoutButton';

describe('CheckoutButton', () => {
    let defaultProps: CheckoutButtonProps;

    beforeEach(() => {
        const checkoutService = createCheckoutService();

        defaultProps = {
            checkoutService,
            checkoutState: checkoutService.getState(),
            containerId: 'button-container',
            language: createLanguageService(),
            methodId: 'foobar',
            onUnhandledError: jest.fn(),
        };
    });

    it('initializes when component is mounted', () => {
        const { checkoutService, onUnhandledError } = defaultProps;

        jest.spyOn(checkoutService, 'initializeCustomer')
            .mockResolvedValue(checkoutService.getState());

        mount(<CheckoutButton { ...defaultProps } />);

        expect(checkoutService.initializeCustomer)
            .toHaveBeenCalledWith({
                methodId: 'foobar',
                foobar: {
                    container: 'button-container',
                    onUnhandledError,
                },
            });
    });

    it('deinitializes when component is unmounted', () => {
        const { checkoutService } = defaultProps;

        jest.spyOn(checkoutService, 'initializeCustomer')
            .mockResolvedValue(checkoutService.getState());
        jest.spyOn(checkoutService, 'deinitializeCustomer')
            .mockResolvedValue(checkoutService.getState());

        const component = mount(<CheckoutButton { ...defaultProps } />);

        component.unmount();

        expect(checkoutService.deinitializeCustomer)
            .toHaveBeenCalledWith({
                methodId: 'foobar',
            });
    });

    it('renders empty container with provided ID', () => {
        const { checkoutService } = defaultProps;

        jest.spyOn(checkoutService, 'initializeCustomer')
            .mockResolvedValue(checkoutService.getState());

        const component = mount(<CheckoutButton { ...defaultProps } />);

        expect(component.html())
            .toEqual('<div id="button-container"></div>');
    });
});
