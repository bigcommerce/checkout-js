import { createCheckoutService, PaymentInitializeOptions } from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { getPaymentMethod } from '../payment-methods.mock';
import PaymentContext, { PaymentContextProps } from '../PaymentContext';

import { PaymentMethodId } from '.';
import AmazonPaymentMethod, { AmazonPaymentMethodProps } from './AmazonPaymentMethod';
import HostedWidgetPaymentMethod from './HostedWidgetPaymentMethod';

describe('When using AmazonPaymentMethod', () => {
    const checkoutService = createCheckoutService();
    let defaultProps: AmazonPaymentMethodProps;
    let initializePaymentOptions: PaymentInitializeOptions;
    let component: ReactWrapper;
    let paymentContext: PaymentContextProps;

    beforeEach(() => {
        paymentContext = {
            disableSubmit: jest.fn(),
            setSubmit: jest.fn(),
            setValidationSchema: jest.fn(),
            hidePaymentSubmitButton: jest.fn(),
        };
        defaultProps = {
            method: {
                ...getPaymentMethod(),
                id: 'amazon',
                gateway: PaymentMethodId.Amazon,
            },
            initializePayment: jest.fn((options: PaymentInitializeOptions) => {
                initializePaymentOptions = options;

                return Promise.resolve(checkoutService.getState());
            }),
            initializeCustomer: jest.fn(),
            deinitializePayment: jest.fn(),
            onUnhandledError: jest.fn(),
        };

        const TestComponent: FunctionComponent<Partial<AmazonPaymentMethodProps>> = props =>
            <PaymentContext.Provider value={ paymentContext }>
                <AmazonPaymentMethod
                    { ...defaultProps }
                    { ...props }
                />
            </PaymentContext.Provider>;

        component = mount(<TestComponent />);
    });

    it('Shopper should be able to see Amazon Payment Method', () => {

        expect(component.find(HostedWidgetPaymentMethod).exists).toBeTruthy();
    });

    it('Shopper should be able to SignInAmazon', () => {
        const onClick = jest.fn();
        jest.spyOn(document, 'querySelector')
            .mockImplementation((selector: string) => {
                const element = document.createElement('div');
                element.id = selector;
                element.addEventListener('click', onClick);

                return element;
            });

        const hostedWidget = component.find(HostedWidgetPaymentMethod);

        const { signInCustomer = noop } = hostedWidget.props();
        signInCustomer();
        expect(onClick).toHaveBeenCalled();
    });

    it('should initialize customer', () => {
        const hostedWidget = component.find(HostedWidgetPaymentMethod);
        const { initializeCustomer = noop } = hostedWidget.props();

        initializeCustomer({
            methodId: defaultProps.method.id,
        });

        expect(defaultProps.initializeCustomer).toBeCalledWith({
            methodId: 'amazon',
            amazon: {
                container: 'paymentWidget',
                onError: expect.any(Function),
            },
        });
    });

    it('should be able to handle error', () => {
        const hostedWidget = component.find(HostedWidgetPaymentMethod);
        const { initializePayment = noop } = hostedWidget.props();

        initializePayment({
            methodId: defaultProps.method.id,
        });
        const { onError = noop } = initializePaymentOptions.amazon || {};

        onError({ message: 'An error' });

        expect(defaultProps.onUnhandledError).toHaveBeenCalledWith({
            message: 'An error',
        });

        expect(paymentContext.disableSubmit).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'amazon',
            }),
            true
        );
    });

    it('should be able to handle payment select', () => {
        const hostedWidget = component.find(HostedWidgetPaymentMethod);
        const { initializePayment = noop } = hostedWidget.props();

        initializePayment({
            methodId: defaultProps.method.id,
        });
        const { onPaymentSelect = noop } = initializePaymentOptions.amazon || {};

        onPaymentSelect();

        expect(paymentContext.disableSubmit).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'amazon',
            }),
            false
        );
    });
});
