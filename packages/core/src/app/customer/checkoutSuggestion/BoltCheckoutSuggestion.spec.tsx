import { mount } from 'enzyme';
import React, { FunctionComponent } from 'react';
import { act } from 'react-dom/test-utils';

import BoltCheckoutSuggestion, { BoltCheckoutSuggestionProps } from './BoltCheckoutSuggestion';

describe('BoltCheckoutSuggestion', () => {
    let defaultProps: BoltCheckoutSuggestionProps;
    let TestComponent: FunctionComponent<Partial<BoltCheckoutSuggestionProps>>;

    beforeEach(() => {
        defaultProps = {
            deinitializeCustomer: jest.fn(),
            executePaymentMethodCheckout: jest.fn(),
            initializeCustomer: jest.fn(),
            onUnhandledError: jest.fn(),
            isExecutingPaymentMethodCheckout: false,
            methodId: 'bolt',
        };

        TestComponent = (props) => <BoltCheckoutSuggestion {...defaultProps} {...props} />;
    });

    it('deinitializes previous Bolt customer strategy before initialisation', () => {
        mount(<TestComponent />);

        expect(defaultProps.deinitializeCustomer).toHaveBeenCalledWith({ methodId: 'bolt' });
    });

    it('initialises Bolt customer strategy with required options', () => {
        mount(<TestComponent />);

        const deinitializeOptions = { methodId: 'bolt' };
        const initializeOptions = {
            methodId: 'bolt',
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

        mount(<TestComponent />);

        expect(defaultProps.onUnhandledError).toHaveBeenCalledWith(expect.any(Error));
    });

    it('do not render Bolt suggestion block if the customer has not bolt account', async () => {
        const component = mount(<TestComponent />);
        const customerHasBoltAccount = false;
        const initializeOptions = (defaultProps.initializeCustomer as jest.Mock).mock.calls[0][0];

        act(() => {
            initializeOptions.bolt.onInit(customerHasBoltAccount);
        });

        await new Promise((resolve) => process.nextTick(resolve));
        component.update();

        expect(component.find('[data-test="suggestion-action-button"]')).toHaveLength(0);
    });

    it('renders Bolt suggestion block if the customer has bolt account', async () => {
        const component = mount(<TestComponent />);
        const customerHasBoltAccount = true;
        const initializeOptions = (defaultProps.initializeCustomer as jest.Mock).mock.calls[0][0];

        act(() => {
            initializeOptions.bolt.onInit(customerHasBoltAccount);
        });

        await new Promise((resolve) => process.nextTick(resolve));
        component.update();

        expect(component.find('[data-test="suggestion-action-button"]')).toHaveLength(1);
    });

    it('executes Bolt Checkout', async () => {
        const component = mount(<TestComponent />);
        const customerHasBoltAccount = true;
        const initializeOptions = (defaultProps.initializeCustomer as jest.Mock).mock.calls[0][0];

        act(() => initializeOptions.bolt.onInit(customerHasBoltAccount));

        await new Promise((resolve) => process.nextTick(resolve));
        component.update();

        const actionButton = component.find('[data-test="suggestion-action-button"]');

        expect(actionButton).toHaveLength(1);

        actionButton.simulate('click');

        expect(defaultProps.executePaymentMethodCheckout).toHaveBeenCalledWith({
            methodId: defaultProps.methodId,
        });
    });
});
