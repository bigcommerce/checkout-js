import { createCheckoutService, CheckoutSelectors, CheckoutService } from '@bigcommerce/checkout-sdk';
import { mount, render } from 'enzyme';
import React, { FunctionComponent } from 'react';

import { CheckoutProvider } from '../../checkout';
import { getCheckout } from '../../checkout/checkouts.mock';
import { getStoreConfig } from '../../config/config.mock';
import { LocaleProvider } from '../../locale';

import BoltCheckoutSuggestion from './BoltCheckoutSuggestion';
import CheckoutSuggestion, { CheckoutSuggestionProps, WithCheckoutSuggestionsProps } from './CheckoutSuggestion';

describe('CheckoutSuggestion', () => {
    let defaultProps: WithCheckoutSuggestionsProps & CheckoutSuggestionProps;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let TestComponent: FunctionComponent<WithCheckoutSuggestionsProps & CheckoutSuggestionProps>;

    beforeEach(() => {
        defaultProps = {
            deinitializeCustomer: jest.fn(),
            executePaymentMethodCheckout: jest.fn(),
            initializeCustomer: jest.fn(),
            isExecutingPaymentMethodCheckout: false,
            providerWithCustomCheckout: null,
            onUnhandledError: jest.fn(),
        };

        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();

        jest.spyOn(checkoutState.data, 'getCheckout')
            .mockReturnValue(getCheckout());

        jest.spyOn(checkoutState.data, 'getConfig')
            .mockReturnValue(getStoreConfig());

        TestComponent = props => (
            <CheckoutProvider checkoutService={ checkoutService }>
                <LocaleProvider checkoutService={ checkoutService }>
                    <CheckoutSuggestion { ...props } />
                </LocaleProvider>
            </CheckoutProvider>
        );
    });

    it('does not render anything if method id is not provided', () => {
        const component = render(<TestComponent { ...defaultProps } />);

        expect(component.html().length).toBe(0);
    });

    it('initializes Bolt Checkout suggestion block', () => {
        const container = mount(<TestComponent { ...defaultProps } providerWithCustomCheckout="bolt" />);
        const component = container.find(BoltCheckoutSuggestion);

        expect(component.props())
            .toEqual(expect.objectContaining({
                deinitializeCustomer: expect.any(Function),
                executePaymentMethodCheckout: expect.any(Function),
                initializeCustomer: expect.any(Function),
                isExecutingPaymentMethodCheckout: false,
                methodId: 'bolt',
                onUnhandledError: expect.any(Function),
            }));

        expect(defaultProps.initializeCustomer).toHaveBeenCalledWith({
            methodId: 'bolt',
            bolt: {
                onInit: expect.any(Function),
            },
        });
    });
});
