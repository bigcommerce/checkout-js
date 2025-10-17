import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import { createBoltCustomerStrategy } from '@bigcommerce/checkout-sdk/integrations/bolt';
import React, { type FunctionComponent } from 'react';

import { AnalyticsProviderMock } from '@bigcommerce/checkout/contexts';
import { LocaleProvider } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';
import { render } from '@bigcommerce/checkout/test-utils';

import { getCheckout } from '../../checkout/checkouts.mock';
import { getStoreConfig } from '../../config/config.mock';

import CheckoutSuggestion, {
    type CheckoutSuggestionProps,
    type WithCheckoutSuggestionsProps,
} from './CheckoutSuggestion';

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

        jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue(getCheckout());

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        TestComponent = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleProvider checkoutService={checkoutService}>
                    <AnalyticsProviderMock>
                        <CheckoutSuggestion {...props} />
                    </AnalyticsProviderMock>
                </LocaleProvider>
            </CheckoutProvider>
        );
    });

    it('does not render anything if method id is not provided', () => {
        const { container } = render(<TestComponent {...defaultProps} />);

        expect(container.innerHTML).toHaveLength(0);
    });

    it('initializes Bolt Checkout suggestion block', () => {
        const { container } = render(
            <TestComponent {...defaultProps} providerWithCustomCheckout="bolt" />,
        );

        expect(container.innerHTML).toHaveLength(0);

        expect(defaultProps.initializeCustomer).toHaveBeenCalledWith({
            methodId: 'bolt',
            integrations: [createBoltCustomerStrategy],
            bolt: {
                onInit: expect.any(Function),
            },
        });
    });
});
