import { createCheckoutService, BillingAddress, Checkout, CheckoutService, Customer as CustomerData, StoreConfig } from '@bigcommerce/checkout-sdk';
import { mount, render, ReactWrapper } from 'enzyme';
import React, { FunctionComponent } from 'react';

import { getBillingAddress } from '../billing/billingAddresses.mock';
import { CheckoutProvider } from '../checkout';
import { getCheckout } from '../checkout/checkouts.mock';
import { getStoreConfig } from '../config/config.mock';
import { createLocaleContext, LocaleContext, LocaleContextType } from '../locale';

import { getGuestCustomer } from './customers.mock';
import Customer, { CustomerProps, WithCheckoutCustomerProps } from './Customer';
import CustomerViewType from './CustomerViewType';
import GuestForm, { GuestFormProps } from './GuestForm';
import LoginForm, { LoginFormProps } from './LoginForm';

describe('Customer', () => {
    let CustomerTest: FunctionComponent<CustomerProps & Partial<WithCheckoutCustomerProps>>;
    let billingAddress: BillingAddress;
    let checkout: Checkout;
    let checkoutService: CheckoutService;
    let config: StoreConfig;
    let customer: CustomerData;
    let localeContext: LocaleContextType;

    beforeEach(() => {
        billingAddress = getBillingAddress();
        checkout = getCheckout();
        customer = getGuestCustomer();
        config = getStoreConfig();

        checkoutService = createCheckoutService();

        jest.spyOn(checkoutService.getState().data, 'getBillingAddress')
            .mockReturnValue(billingAddress);

        jest.spyOn(checkoutService.getState().data, 'getCheckout')
            .mockReturnValue(checkout);

        jest.spyOn(checkoutService.getState().data, 'getCustomer')
            .mockReturnValue(customer);

        jest.spyOn(checkoutService.getState().data, 'getConfig')
            .mockReturnValue(config);

        localeContext = createLocaleContext(getStoreConfig());

        CustomerTest = props => (
            <CheckoutProvider checkoutService={ checkoutService }>
                <LocaleContext.Provider value={ localeContext }>
                    <Customer { ...props } />
                </LocaleContext.Provider>
            </CheckoutProvider>
        );
    });

    describe('when view type is "guest"', () => {
        it('matches snapshot', () => {
            expect(render(
                <CustomerTest viewType={ CustomerViewType.Guest } />
            ))
                .toMatchSnapshot();
        });

        it('renders guest form by default', () => {
            const component = mount(
                <CustomerTest viewType={ CustomerViewType.Guest } />
            );

            expect(component.find(GuestForm).exists())
                .toEqual(true);
        });

        it('renders guest form if billing address is undefined', () => {
            jest.spyOn(checkoutService.getState().data, 'getBillingAddress')
                .mockReturnValue(undefined);

            const component = mount(
                <CustomerTest viewType={ CustomerViewType.Guest } />
            );

            expect(component.find(GuestForm).exists())
                .toEqual(true);
        });

        it('renders guest form if customer is undefined', () => {
            jest.spyOn(checkoutService.getState().data, 'getCustomer')
                .mockReturnValue(undefined);

            const component = mount(
                <CustomerTest viewType={ CustomerViewType.Guest } />
            );

            expect(component.find(GuestForm).exists())
                .toEqual(true);
        });

        it('passes data to guest form', () => {
            const component = mount(
                <CustomerTest viewType={ CustomerViewType.Guest } />
            );

            expect(component.find(GuestForm).props())
                .toMatchObject({
                    canSubscribe: config.shopperConfig.showNewsletterSignup,
                    defaultShouldSubscribe: config.shopperConfig.defaultNewsletterSignup,
                    email: billingAddress.email,
                });
        });

        it('continues checkout as guest and does not send consent if not required', () => {
            jest.spyOn(checkoutService, 'continueAsGuest')
                .mockReturnValue(Promise.resolve(checkoutService.getState()));

            const subscribeToNewsletter = jest.fn();
            const component = mount(
                <CustomerTest
                    requiresMarketingConsent={ false }
                    subscribeToNewsletter={ subscribeToNewsletter }
                    viewType={ CustomerViewType.Guest }
                />
            );

            (component.find(GuestForm) as ReactWrapper<GuestFormProps>)
                .prop('onContinueAsGuest')({
                    email: ' test@bigcommerce.com ',
                    shouldSubscribe: true,
                });

            expect(checkoutService.continueAsGuest)
                .toHaveBeenCalledWith({
                    email: 'test@bigcommerce.com',
                    marketingEmailConsent: undefined,
                });
        });

        it('continues checkout as guest, subscribes to newsletter and sends marketing consent', () => {
            jest.spyOn(checkoutService, 'continueAsGuest')
                .mockReturnValue(Promise.resolve(checkoutService.getState()));

            const subscribeToNewsletter = jest.fn();
            const component = mount(
                <CustomerTest
                    requiresMarketingConsent={ true }
                    subscribeToNewsletter={ subscribeToNewsletter }
                    viewType={ CustomerViewType.Guest }
                />
            );

            (component.find(GuestForm) as ReactWrapper<GuestFormProps>)
                .prop('onContinueAsGuest')({
                    email: ' test@bigcommerce.com ',
                    shouldSubscribe: true,
                });

            expect(checkoutService.continueAsGuest)
                .toHaveBeenCalledWith({
                    email: 'test@bigcommerce.com',
                    marketingEmailConsent: true,
                });

            expect(subscribeToNewsletter)
                .toHaveBeenCalledWith({
                    email: 'test@bigcommerce.com',
                    firstName: expect.any(String),
                });
        });

        it('only subscribes to newsletter if allowed by customer', () => {
            jest.spyOn(checkoutService, 'continueAsGuest')
                .mockReturnValue(Promise.resolve(checkoutService.getState()));

            const subscribeToNewsletter = jest.fn();
            const component = mount(
                <CustomerTest
                    subscribeToNewsletter={ subscribeToNewsletter }
                    viewType={ CustomerViewType.Guest }
                />
            );

            (component.find(GuestForm) as ReactWrapper<GuestFormProps>)
                .prop('onContinueAsGuest')({
                    email: 'test@bigcommerce.com',
                    shouldSubscribe: false,
                });

            expect(checkoutService.continueAsGuest)
                .toHaveBeenCalledWith({
                    email: 'test@bigcommerce.com',
                    marketingEmailConsent: undefined,
                });

            expect(subscribeToNewsletter)
                .not.toHaveBeenCalled();
        });

        it('changes to login view when "show login" event is received', () => {
            const handleChangeViewType = jest.fn();
            const component = mount(
                <CustomerTest
                    onChangeViewType={ handleChangeViewType }
                    viewType={ CustomerViewType.Guest }
                />
            );

            (component.find(GuestForm) as ReactWrapper<GuestFormProps>)
                .prop('onShowLogin')();

            expect(handleChangeViewType)
                .toHaveBeenCalledWith(CustomerViewType.Login);
        });

        it('triggers completion callback if customer successfully continued as guest', async () => {
            jest.spyOn(checkoutService, 'continueAsGuest')
                .mockReturnValue(Promise.resolve(checkoutService.getState()));

            const handleContinueAsGuest = jest.fn();
            const component = mount(
                <CustomerTest
                    onContinueAsGuest={ handleContinueAsGuest }
                    viewType={ CustomerViewType.Guest }
                />
            );

            (component.find(GuestForm) as ReactWrapper<GuestFormProps>)
                .prop('onContinueAsGuest')({
                    email: 'test@bigcommerce.com',
                    shouldSubscribe: false,
                });

            await new Promise(resolve => process.nextTick(resolve));

            expect(handleContinueAsGuest)
                .toHaveBeenCalled();
        });

        it('triggers error callback if customer is unable to continue as guest', async () => {
            jest.spyOn(checkoutService, 'continueAsGuest')
                .mockRejectedValue({ type: 'unknown_error' });

            const handleError = jest.fn();
            const component = mount(
                <CustomerTest
                    onContinueAsGuestError={ handleError }
                    viewType={ CustomerViewType.Guest }
                />
            );

            (component.find(GuestForm) as ReactWrapper<GuestFormProps>)
                .prop('onContinueAsGuest')({
                    email: 'test@bigcommerce.com',
                    shouldSubscribe: false,
                });

            await new Promise(resolve => process.nextTick(resolve));

            expect(handleError)
                .toHaveBeenCalled();
        });

        it('retains draft email address when switching to login view', () => {
            const component = mount(
                <CustomerTest viewType={ CustomerViewType.Guest } />
            );

            (component.find(GuestForm) as ReactWrapper<GuestFormProps>)
                .prop('onChangeEmail')('test@bigcommerce.com');

            component.setProps({ viewType: CustomerViewType.Login });
            component.update();

            expect((component.find(LoginForm) as ReactWrapper<LoginFormProps>).prop('email'))
                .toEqual('test@bigcommerce.com');
        });
    });

    describe('when view type is "login"', () => {
        it('matches snapshot', () => {
            const component = mount(
                <CustomerTest viewType={ CustomerViewType.Login } />
            );

            expect(component.render())
                .toMatchSnapshot();
        });

        it('renders login form', () => {
            const component = mount(
                <CustomerTest viewType={ CustomerViewType.Login } />
            );

            expect(component.find(LoginForm).exists())
                .toEqual(true);
        });

        it('passes data to login form', () => {
            const component = mount(
                <CustomerTest viewType={ CustomerViewType.Login } />
            );

            expect(component.find(LoginForm).props())
                .toMatchObject({
                    email: billingAddress.email,
                    canCancel: config.checkoutSettings.guestCheckoutEnabled,
                    createAccountUrl: config.links.createAccountLink,
                    forgotPasswordUrl: config.links.forgotPasswordLink,
                });
        });

        it('handles "sign in" event', () => {
            jest.spyOn(checkoutService, 'signInCustomer')
                .mockReturnValue(Promise.resolve(checkoutService.getState()));

            const component = mount(
                <CustomerTest viewType={ CustomerViewType.Login } />
            );

            (component.find(LoginForm) as ReactWrapper<LoginFormProps>)
                .prop('onSignIn')({
                    email: 'test@bigcommerce.com',
                    password: 'password1',
                });

            expect(checkoutService.signInCustomer)
                .toHaveBeenCalledWith({
                    email: 'test@bigcommerce.com',
                    password: 'password1',
                });
        });

        it('triggers completion callback if customer is successfully signed in', async () => {
            jest.spyOn(checkoutService, 'signInCustomer')
                .mockReturnValue(Promise.resolve(checkoutService.getState()));

            const handleSignedIn = jest.fn();
            const component = mount(
                <CustomerTest
                    onSignIn={ handleSignedIn }
                    viewType={ CustomerViewType.Login }
                />
            );

            (component.find(LoginForm) as ReactWrapper<LoginFormProps>)
                .prop('onSignIn')({
                    email: 'test@bigcommerce.com',
                    password: 'password1',
                });

            await new Promise(resolve => process.nextTick(resolve));

            expect(handleSignedIn)
                .toHaveBeenCalled();
        });

        it('triggers error callback if customer is unable to sign in', async () => {
            jest.spyOn(checkoutService, 'signInCustomer')
                .mockRejectedValue({ type: 'unknown_error' });

            const handleError = jest.fn();
            const component = mount(
                <CustomerTest
                    onSignInError={ handleError }
                    viewType={ CustomerViewType.Login }
                />
            );

            (component.find(LoginForm) as ReactWrapper<LoginFormProps>)
                .prop('onSignIn')({
                    email: 'test@bigcommerce.com',
                    password: 'password1',
                });

            await new Promise(resolve => process.nextTick(resolve));

            expect(handleError)
                .toHaveBeenCalled();
        });

        it('clears error when "cancel" event is triggered', () => {
            const error = new Error();

            jest.spyOn(checkoutService.getState().errors, 'getSignInError')
                .mockReturnValue(error);

            jest.spyOn(checkoutService, 'clearError')
                .mockReturnValue(Promise.resolve(checkoutService.getState()));

            const component = mount(
                <CustomerTest viewType={ CustomerViewType.Login } />
            );

            (component.find(LoginForm) as ReactWrapper<LoginFormProps>)
                // tslint:disable-next-line:no-non-null-assertion
                .prop('onCancel')!();

            expect(checkoutService.clearError)
                .toHaveBeenCalledWith(error);
        });

        it('changes to guest view when "cancel" event is triggered', () => {
            const handleChangeViewType = jest.fn();
            const component = mount(
                <CustomerTest
                    onChangeViewType={ handleChangeViewType }
                    viewType={ CustomerViewType.Login }
                />
            );

            (component.find(LoginForm) as ReactWrapper<LoginFormProps>)
                // tslint:disable-next-line:no-non-null-assertion
                .prop('onCancel')!();

            expect(handleChangeViewType)
                .toHaveBeenCalledWith(CustomerViewType.Guest);
        });

        it('retains draft email address when switching to guest view', () => {
            const component = mount(
                <CustomerTest viewType={ CustomerViewType.Login } />
            );

            (component.find(LoginForm) as ReactWrapper<LoginFormProps>)
                // tslint:disable-next-line:no-non-null-assertion
                .prop('onChangeEmail')!('test@bigcommerce.com');

            component.setProps({ viewType: CustomerViewType.Guest });
            component.update();

            expect((component.find(GuestForm) as ReactWrapper<GuestFormProps>).prop('email'))
                .toEqual('test@bigcommerce.com');
        });
    });
});
