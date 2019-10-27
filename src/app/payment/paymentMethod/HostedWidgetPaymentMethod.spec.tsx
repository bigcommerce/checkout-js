import { createCheckoutService, CheckoutSelectors, CheckoutService } from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { getCart } from '../../cart/carts.mock';
import { CheckoutProvider } from '../../checkout';
import { getCheckout, getCheckoutPayment } from '../../checkout/checkouts.mock';
import { getStoreConfig } from '../../config/config.mock';
import { getCustomer } from '../../customer/customers.mock';
import { getConsignment } from '../../shipping/consignment.mock';
import { LoadingOverlay } from '../../ui/loading';
import { CreditCardStorageField } from '../creditCard';
import { getPaymentMethod } from '../payment-methods.mock';
import * as storedInstrumentModule from '../storedInstrument';
import { getInstruments } from '../storedInstrument/instruments.mock';
import PaymentContext, { PaymentContextProps } from '../PaymentContext';

import HostedWidgetPaymentMethod, { HostedWidgetPaymentMethodProps } from './HostedWidgetPaymentMethod';
import SignOutLink, { SignOutLinkProps } from './SignOutLink';

describe('HostedWidgetPaymentMethod', () => {
    let HostedWidgetPaymentMethodTest: FunctionComponent<HostedWidgetPaymentMethodProps>;
    let defaultProps: HostedWidgetPaymentMethodProps;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let paymentContext: PaymentContextProps;

    beforeEach(() => {
        defaultProps = {
            containerId: 'widget-container',
            deinitializePayment: jest.fn(),
            initializePayment: jest.fn(),
            method: getPaymentMethod(),
        };

        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        paymentContext = {
            disableSubmit: jest.fn(),
            setSubmit: jest.fn(),
            setValidationSchema: jest.fn(),
        };

        jest.spyOn(checkoutState.data, 'getCheckout')
            .mockReturnValue(getCheckout());

        jest.spyOn(checkoutState.data, 'isPaymentDataRequired')
            .mockReturnValue(true);

        jest.spyOn(checkoutState.data, 'getCart')
            .mockReturnValue(getCart());

        jest.spyOn(checkoutState.data, 'getConfig')
            .mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutState.data, 'getConsignments')
            .mockReturnValue([getConsignment()]);

        jest.spyOn(checkoutState.data, 'getCustomer')
            .mockReturnValue(getCustomer());

        jest.spyOn(checkoutState.data, 'isPaymentDataRequired')
            .mockReturnValue(true);

        HostedWidgetPaymentMethodTest = props => (
            <CheckoutProvider checkoutService={ checkoutService }>
                <PaymentContext.Provider value={ paymentContext }>
                    <Formik
                        initialValues={ {} }
                        onSubmit={ noop }
                    >
                        <HostedWidgetPaymentMethod { ...props } />
                    </Formik>
                </PaymentContext.Provider>
            </CheckoutProvider>
        );
    });

    it('initializes payment method when component mounts', () => {
        mount(<HostedWidgetPaymentMethodTest { ...defaultProps } />);

        expect(defaultProps.initializePayment)
            .toHaveBeenCalled();
        expect(paymentContext.setSubmit).toHaveBeenCalled();
    });

    it('deinitializes payment method when component unmounts', () => {
        const component = mount(<HostedWidgetPaymentMethodTest { ...defaultProps } />);

        expect(defaultProps.deinitializePayment)
            .not.toHaveBeenCalled();

        component.unmount();

        expect(defaultProps.deinitializePayment)
            .toHaveBeenCalled();
    });

    it('does not initialize payment method if payment data is not required', () => {
        jest.spyOn(checkoutState.data, 'isPaymentDataRequired')
            .mockReturnValue(false);

        mount(<HostedWidgetPaymentMethodTest { ...defaultProps } />);

        expect(defaultProps.initializePayment)
            .not.toHaveBeenCalled();
    });

    it('renders loading overlay while waiting for method to initialize', () => {
        let component: ReactWrapper;

        component = mount(<HostedWidgetPaymentMethodTest
            { ...defaultProps }
            isInitializing
        />);

        expect(component.find(LoadingOverlay).prop('isLoading'))
            .toEqual(true);

        component = mount(<HostedWidgetPaymentMethodTest { ...defaultProps } />);

        expect(component.find(LoadingOverlay).prop('isLoading'))
            .toEqual(false);
    });

    it('hides content while loading', () => {
        const component = mount(<HostedWidgetPaymentMethodTest { ...defaultProps } />);

        expect(component.find(LoadingOverlay).prop('hideContentWhenLoading'))
            .toEqual(true);
    });

    it('renders placeholder container with provided ID', () => {
        const component = mount(<HostedWidgetPaymentMethodTest { ...defaultProps } />);

        expect(component.exists(`#${defaultProps.containerId}`))
            .toEqual(true);
    });

    it('does not render sign out link', () => {
        const component = mount(<HostedWidgetPaymentMethodTest { ...defaultProps } />);

        expect(component.find(SignOutLink))
            .toHaveLength(0);
    });

    describe('when user is signed into their payment method account', () => {
        beforeEach(() => {
            jest.spyOn(checkoutState.data, 'getCheckout')
                .mockReturnValue({
                    ...getCheckout(),
                    payments: [
                        { ...getCheckoutPayment(), providerId: defaultProps.method.id },
                    ],
                });
        });

        it('renders sign out link if user is signed into their payment method account', () => {
            const component = mount(<HostedWidgetPaymentMethodTest { ...defaultProps } />);

            expect(component.find(SignOutLink))
                .toHaveLength(1);
        });

        it('signs out from payment method account of user when clicking on sign out link', async () => {
            const handleSignOutError = jest.fn();

            jest.spyOn(checkoutService, 'signOutCustomer')
                .mockResolvedValue(checkoutState);

            const component = mount(<HostedWidgetPaymentMethodTest
                { ...defaultProps }
                onSignOutError={ handleSignOutError }
            />);

            (component.find(SignOutLink) as ReactWrapper<SignOutLinkProps>).prop('onSignOut')();

            await new Promise(resolve => process.nextTick(resolve));

            expect(checkoutService.signOutCustomer)
                .toHaveBeenCalledWith({ methodId: defaultProps.method.id });

            expect(handleSignOutError)
                .not.toHaveBeenCalled();
        });

        it('notifies parent component if unable to sign out', async () => {
            const handleSignOutError = jest.fn();

            jest.spyOn(checkoutService, 'signOutCustomer')
                .mockRejectedValue(new Error('Unknown error'));

            const component = mount(<HostedWidgetPaymentMethodTest
                { ...defaultProps }
                onSignOutError={ handleSignOutError }
            />);

            (component.find(SignOutLink) as ReactWrapper<SignOutLinkProps>).prop('onSignOut')();

            await new Promise(resolve => process.nextTick(resolve));

            expect(handleSignOutError)
                .toHaveBeenCalledWith(expect.any(Error));
        });
    });

    describe('when user is not signed into their payment method account and is required to', () => {
        beforeEach(() => {
            defaultProps = {
                ...defaultProps,
                deinitializeCustomer: jest.fn(),
                initializeCustomer: jest.fn(),
                isSignInRequired: true,
                signInCustomer: jest.fn(),
            };
        });

        it('asks user to sign in when payment form is submitted', () => {
            mount(<HostedWidgetPaymentMethodTest { ...defaultProps } />);

            expect(defaultProps.initializeCustomer)
                .toHaveBeenCalled();

            expect(paymentContext.setSubmit)
                .toHaveBeenCalledWith(defaultProps.method, defaultProps.signInCustomer);
        });

        it('does not ask user to sign in if payment data is not required', () => {
            jest.spyOn(checkoutState.data, 'isPaymentDataRequired')
                .mockReturnValue(false);

            mount(<HostedWidgetPaymentMethodTest { ...defaultProps } />);

            expect(defaultProps.initializeCustomer)
                .not.toHaveBeenCalled();

            expect(paymentContext.setSubmit)
                .not.toHaveBeenCalledWith(defaultProps.method, defaultProps.signInCustomer);
        });
    });

    describe('if stored instrument feature is available', () => {
        beforeEach(() => {
            jest.spyOn(storedInstrumentModule, 'isInstrumentFeatureAvailable')
                .mockReturnValue(true);
            jest.spyOn(checkoutState.data, 'getInstruments')
                .mockReturnValue(getInstruments());
            jest.spyOn(checkoutService, 'loadInstruments')
                .mockResolvedValue(checkoutState);
        });

        it('loads stored instruments when component mounts', () => {
            mount(<HostedWidgetPaymentMethodTest { ...defaultProps } />);

            expect(checkoutService.loadInstruments)
                .toHaveBeenCalled();
        });

        it('only shows instruments fieldset when there is at least one stored instrument', () => {
            const component = mount(<HostedWidgetPaymentMethodTest { ...defaultProps } />);

            expect(component.find(storedInstrumentModule.InstrumentFieldset))
                .toHaveLength(1);
        });

        it('does not show instruments fieldset when there are no stored instruments', () => {
            jest.spyOn(checkoutState.data, 'getInstruments')
                .mockReturnValue([]);

            const component = mount(<HostedWidgetPaymentMethodTest { ...defaultProps } />);

            expect(component.find(storedInstrumentModule.InstrumentFieldset))
                .toHaveLength(0);
        });

        it('uses PaymentMethod to retrieve instruments', () => {
            mount(<HostedWidgetPaymentMethodTest { ...defaultProps } />);

            expect(checkoutState.data.getInstruments)
                .toHaveBeenCalledWith(defaultProps.method);
        });

        it('shows hosted widget and save credit card form when there are no stored instruments', () => {
            jest.spyOn(checkoutState.data, 'getInstruments')
                .mockReturnValue([]);

            const container = mount(<HostedWidgetPaymentMethodTest { ...defaultProps } />);
            const hostedWidgetComponent = container.find('#widget-container');
            const creditCardStorageFieldComponent = container.find(CreditCardStorageField);

            expect(hostedWidgetComponent)
                .toHaveLength(1);

            expect(creditCardStorageFieldComponent)
                .toHaveLength(1);
        });
    });
});
