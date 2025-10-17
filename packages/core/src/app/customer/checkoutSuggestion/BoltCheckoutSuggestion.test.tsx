import { createCheckoutService } from '@bigcommerce/checkout-sdk';
import { createBoltCustomerStrategy } from '@bigcommerce/checkout-sdk/integrations/bolt';
import userEvent from '@testing-library/user-event';
import React, { act, type FunctionComponent } from 'react';

import { type AnalyticsEvents, AnalyticsProviderMock } from '@bigcommerce/checkout/contexts';
import { LocaleProvider } from '@bigcommerce/checkout/locale';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import BoltCheckoutSuggestion, { type BoltCheckoutSuggestionProps } from './BoltCheckoutSuggestion';

describe('BoltCheckoutSuggestion', () => {
    let defaultProps: BoltCheckoutSuggestionProps;
    let TestComponent: FunctionComponent<Partial<BoltCheckoutSuggestionProps>>;
    let analyticsTrackerMock: Partial<AnalyticsEvents>

    beforeEach(() => {
        defaultProps = {
            deinitializeCustomer: jest.fn(),
            executePaymentMethodCheckout: jest.fn(),
            initializeCustomer: jest.fn(),
            onUnhandledError: jest.fn(),
            isExecutingPaymentMethodCheckout: false,
            methodId: 'bolt',
        };

        analyticsTrackerMock = {
            customerSuggestionInit: jest.fn()
        };

        const checkoutService = createCheckoutService();

        TestComponent = (props) =>
            <LocaleProvider checkoutService={checkoutService}>
                <AnalyticsProviderMock analyticsTracker={analyticsTrackerMock}>
                    <BoltCheckoutSuggestion {...defaultProps} {...props} />
                </AnalyticsProviderMock>
            </LocaleProvider>;
    });

    it('deinitializes previous Bolt customer strategy before initialisation', () => {
        render(<TestComponent />);

        expect(defaultProps.deinitializeCustomer).toHaveBeenCalledWith({ methodId: 'bolt' });
    });

    it('initialises Bolt customer strategy with required options', () => {
        render(<TestComponent />);

        const deinitializeOptions = { methodId: 'bolt' };
        const initializeOptions = {
            methodId: 'bolt',
            integrations: [createBoltCustomerStrategy],
            bolt: {
                onInit: expect.any(Function),
            },
        };

        expect(defaultProps.deinitializeCustomer).toHaveBeenCalledWith(deinitializeOptions);
        expect(defaultProps.initializeCustomer).toHaveBeenCalledWith(initializeOptions);
    });

    it('calls onUnhandledError if initialization was failed', () => {
        defaultProps.initializeCustomer = jest.fn(() => {
            throw new Error();
        });

        render(<TestComponent />);

        expect(defaultProps.onUnhandledError).toHaveBeenCalledWith(expect.any(Error));
        expect(analyticsTrackerMock.customerSuggestionInit).not.toHaveBeenCalled();
    });

    it('do not track analytics event if no customer email on initialization', async () => {
       render(<TestComponent />);

        const customerHasBoltAccount = false;
        const initializeOptions = (defaultProps.initializeCustomer as jest.Mock).mock.calls[0][0];

        act(() => {
            initializeOptions.bolt.onInit(customerHasBoltAccount);
        });

        await new Promise((resolve) => process.nextTick(resolve));

        expect(analyticsTrackerMock.customerSuggestionInit).not.toHaveBeenCalled();
    });

    it('do not render Bolt suggestion block if the customer has not bolt account', async () => {
        render(<TestComponent />);

        const customerHasBoltAccount = false;
        const customerEmail = 'test@e.mail';
        const initializeOptions = (defaultProps.initializeCustomer as jest.Mock).mock.calls[0][0];

        act(() => {
            initializeOptions.bolt.onInit(customerHasBoltAccount, customerEmail);
        });

        await new Promise((resolve) => process.nextTick(resolve));

        expect(analyticsTrackerMock.customerSuggestionInit).toHaveBeenCalledWith({ hasBoltAccount: false });
    });

    it('renders Bolt suggestion block if the customer has bolt account', async () => {
        render(<TestComponent />);

        const customerHasBoltAccount = true;
        const customerEmail = 'test@e.mail';
        const initializeOptions = (defaultProps.initializeCustomer as jest.Mock).mock.calls[0][0];

        act(() => {
            initializeOptions.bolt.onInit(customerHasBoltAccount, customerEmail);
        });

        await new Promise((resolve) => process.nextTick(resolve));

        expect(analyticsTrackerMock.customerSuggestionInit).toHaveBeenCalledWith({ hasBoltAccount: true });
    });

    it('executes Bolt Checkout', async () => {
       render(<TestComponent />);

        const customerHasBoltAccount = true;
        const initializeOptions = (defaultProps.initializeCustomer as jest.Mock).mock.calls[0][0];

        act(() => initializeOptions.bolt.onInit(customerHasBoltAccount));

        await new Promise((resolve) => process.nextTick(resolve));

        const actionButton = screen.getByRole('button', {
            name: /bolt bolt checkout/i
          })

       await userEvent.click(actionButton);

        expect(defaultProps.executePaymentMethodCheckout).toHaveBeenCalledWith({
            methodId: defaultProps.methodId,
        });
    });
});
