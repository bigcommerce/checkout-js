import {
    BillingAddress,
    Checkout,
    CheckoutService,
    createCheckoutService,
    Customer as CustomerData,
    StoreConfig,
} from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import React, { FunctionComponent } from 'react';

import { AnalyticsProviderMock } from '@bigcommerce/checkout/analytics';
import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';

import { getBillingAddress } from '../billing/billingAddresses.mock';
import { getCheckout } from '../checkout/checkouts.mock';
import CheckoutStepType from '../checkout/CheckoutStepType';
import { getStoreConfig } from '../config/config.mock';
import { PaymentMethodId } from '../payment/paymentMethod';

import CreateAccountForm from './CreateAccountForm';
import Customer, { CustomerProps, WithCheckoutCustomerProps } from './Customer';
import { getCustomer, getGuestCustomer } from './customers.mock';
import CustomerViewType from './CustomerViewType';
import EmailLoginForm from './EmailLoginForm';
import GuestForm, { GuestFormProps } from './GuestForm';
import LoginForm, { LoginFormProps } from './LoginForm';
import StripeGuestForm from './StripeGuestForm';

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

        jest.spyOn(checkoutService.getState().data, 'getBillingAddress').mockReturnValue(
            billingAddress,
        );

        jest.spyOn(checkoutService.getState().data, 'getCheckout').mockReturnValue(checkout);

        jest.spyOn(checkoutService.getState().data, 'getCustomer').mockReturnValue(customer);

        jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue(config);

        jest.spyOn(checkoutService, 'loadPaymentMethods').mockResolvedValue(
            checkoutService.getState(),
        );

        jest.spyOn(checkoutService, 'initializeCustomer').mockResolvedValue(
            checkoutService.getState(),
        );

        jest.spyOn(checkoutService.getState().data, 'getPaymentMethods').mockReturnValue([]);

        localeContext = createLocaleContext(getStoreConfig());

        CustomerTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleContext.Provider value={localeContext}>
                    <AnalyticsProviderMock>
                        <Customer {...props} />
                    </AnalyticsProviderMock>
                </LocaleContext.Provider>
            </CheckoutProvider>
        );
    });

    describe('when view type is "guest"', () => {
        it('matches snapshot', async () => {
            const component = mount(<CustomerTest viewType={CustomerViewType.Guest} />);

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            expect(component.render()).toMatchSnapshot();
        });

        it('renders guest form by default', async () => {
            const component = mount(<CustomerTest viewType={CustomerViewType.Guest} />);

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            expect(component.find(GuestForm).exists()).toBe(true);
        });

        it('renders stripe guest form if enabled', async () => {
            const steps = { isActive: true,
                isComplete: true,
                isEditable: true,
                isRequired: true,
                type: CheckoutStepType.Customer };

            const component = mount(
                <CustomerTest providerWithCustomCheckout={ PaymentMethodId.StripeUPE } step={ steps } viewType={ CustomerViewType.Guest } />
            );

            await new Promise(resolve => process.nextTick(resolve));
            component.update();

            expect(component.find(StripeGuestForm).exists()).toBe(true);
        });

        it('calls onUnhandledError if initialize was failed', async () => {
            jest.spyOn(checkoutService, 'initializeCustomer').mockRejectedValue(new Error());

            const unhandledError = jest.fn();

            mount(<CustomerTest onUnhandledError={ unhandledError } providerWithCustomCheckout='bolt' viewType={ CustomerViewType.Guest } />);
            await new Promise(resolve => process.nextTick(resolve));

            expect(unhandledError).toHaveBeenCalledWith(expect.any(Error));
        });

        it('calls onUnhandledError if deinitialize was failed', async () => {
            jest.spyOn(checkoutService, 'deinitializeCustomer').mockRejectedValue(new Error());

            const unhandledError = jest.fn();

            const component = mount(<CustomerTest onUnhandledError={ unhandledError } viewType={ CustomerViewType.Guest }/>);

            await new Promise(resolve => process.nextTick(resolve));
            component.unmount();
            await new Promise(resolve => process.nextTick(resolve));

            expect(unhandledError).toHaveBeenCalled();
        });

        it('renders guest form if billing address is undefined', async () => {
            jest.spyOn(checkoutService.getState().data, 'getBillingAddress').mockReturnValue(
                undefined,
            );

            const component = mount(<CustomerTest viewType={CustomerViewType.Guest} />);

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            expect(component.find(GuestForm).exists()).toBe(true);
        });

        it('renders guest form if customer is undefined', async () => {
            jest.spyOn(checkoutService.getState().data, 'getCustomer').mockReturnValue(undefined);

            const component = mount(<CustomerTest viewType={CustomerViewType.Guest} />);

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            expect(component.find(GuestForm).exists()).toBe(true);
        });

        it('renders create account form if type is create account', async () => {
            jest.spyOn(checkoutService.getState().data, 'getCustomer').mockReturnValue(undefined);

            jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue({
                ...getStoreConfig(),
                checkoutSettings: {
                    ...getStoreConfig().checkoutSettings,
                    features: {
                        'CHECKOUT-4941.account_creation_in_checkout': true,
                    },
                },
            });

            const component = mount(<CustomerTest viewType={CustomerViewType.CreateAccount} />);

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            expect(component.find(CreateAccountForm).exists()).toBe(true);
        });

        it('passes data to guest form', async () => {
            const component = mount(<CustomerTest isSubscribed={false} viewType={CustomerViewType.Guest} />);

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            expect(component.find(GuestForm).props()).toMatchObject({
                canSubscribe: config.shopperConfig.showNewsletterSignup,
                defaultShouldSubscribe: config.shopperConfig.defaultNewsletterSignup,
                email: billingAddress.email,
            });
        });

        it('continues checkout as guest and does not send consent if not required', async () => {
            jest.spyOn(checkoutService, 'continueAsGuest').mockReturnValue(
                Promise.resolve(checkoutService.getState()),
            );

            const handleNewsletterSubscription=jest.fn();
            const component = mount(<CustomerTest
                isSubscribed={true}
                onSubscribeToNewsletter={handleNewsletterSubscription}
                viewType={CustomerViewType.Guest}
            />);

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            (component.find(GuestForm) as ReactWrapper<GuestFormProps>).prop('onContinueAsGuest')({
                email: ' test@bigcommerce.com ',
                shouldSubscribe: true,
            });

            expect(checkoutService.continueAsGuest).toHaveBeenCalledWith({
                email: 'test@bigcommerce.com',
                acceptsMarketingNewsletter: true,
                acceptsAbandonedCartEmails: true,
            });
        });

        it('only subscribes to newsletter if allowed by customer', async () => {
            jest.spyOn(checkoutService.getState().data, 'getBillingAddress').mockReturnValue({
                ...billingAddress,
                id: '',
            });
            jest.spyOn(checkoutService, 'continueAsGuest').mockReturnValue(
                Promise.resolve(checkoutService.getState()),
            );

            const subscribeToNewsletter = jest.fn();
            const handleNewsletterSubscription = jest.fn();
            const component = mount(<CustomerTest
                isSubscribed={false}
                onSubscribeToNewsletter={handleNewsletterSubscription}
                viewType={CustomerViewType.Guest}
            />);

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            (component.find(GuestForm) as ReactWrapper<GuestFormProps>).prop('onContinueAsGuest')({
                email: 'test@bigcommerce.com',
                shouldSubscribe: false,
            });

            expect(checkoutService.continueAsGuest).toHaveBeenCalledWith({
                email: 'test@bigcommerce.com',
                acceptsMarketingNewsletter: undefined,
                acceptsAbandonedCartEmails: undefined,
            });

            expect(subscribeToNewsletter).not.toHaveBeenCalled();
        });

        it('changes to login view when "show login" event is received', async () => {
            const handleChangeViewType = jest.fn();
            const component = mount(
                <CustomerTest
                    onChangeViewType={handleChangeViewType}
                    viewType={CustomerViewType.Guest}
                />,
            );

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            (component.find(GuestForm) as ReactWrapper<GuestFormProps>).prop('onShowLogin')();

            expect(handleChangeViewType).toHaveBeenCalledWith(CustomerViewType.Login);
        });

        it('triggers completion callback if customer successfully continued as guest', async () => {
            jest.spyOn(checkoutService, 'continueAsGuest').mockReturnValue(
                Promise.resolve(checkoutService.getState()),
            );

            const handleContinueAsGuest = jest.fn();
            const handleNewsletterSubscription = jest.fn();
            const component = mount(
                <CustomerTest
                    isSubscribed={false}
                    onContinueAsGuest={handleContinueAsGuest}
                    onSubscribeToNewsletter={handleNewsletterSubscription}
                    viewType={CustomerViewType.Guest}
                />,
            );

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            (component.find(GuestForm) as ReactWrapper<GuestFormProps>).prop('onContinueAsGuest')({
                email: 'test@bigcommerce.com',
                shouldSubscribe: false,
            });

            await new Promise((resolve) => process.nextTick(resolve));

            expect(handleContinueAsGuest).toHaveBeenCalled();
        });

        it('triggers completion callback if continueAsGuest fails with update_subscriptions', async () => {
            const error = { type: 'update_subscriptions' };

            jest.spyOn(checkoutService, 'continueAsGuest').mockRejectedValue(error);

            const handleContinueAsGuest = jest.fn();
            const handleNewsletterSubscription = jest.fn();
            const component = mount(
                <CustomerTest
                    onContinueAsGuest={handleContinueAsGuest}
                    onSubscribeToNewsletter={handleNewsletterSubscription}
                    viewType={CustomerViewType.Guest}
                />,
            );

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            (component.find(GuestForm) as ReactWrapper<GuestFormProps>).prop('onContinueAsGuest')({
                email: 'test@bigcommerce.com',
                shouldSubscribe: true,
            });

            await new Promise((resolve) => process.nextTick(resolve));

            expect(handleContinueAsGuest).toHaveBeenCalled();
        });

        it('renders CancellableEnforcedLogin if continue as guest fails with code 403', async () => {
            jest.spyOn(checkoutService, 'continueAsGuest').mockRejectedValue({
                status: 403,
                type: '',
            });

            const handleChangeViewType = jest.fn();
            const handleNewsletterSubscription=jest.fn();
            const component = mount(
                <CustomerTest
                    isSubscribed={false}
                    onChangeViewType={handleChangeViewType}
                    onSubscribeToNewsletter={handleNewsletterSubscription}
                    viewType={CustomerViewType.Guest}
                />,
            );

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            (component.find(GuestForm) as ReactWrapper<GuestFormProps>).prop('onContinueAsGuest')({
                email: 'test@bigcommerce.com',
                shouldSubscribe: false,
            });

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            expect(handleChangeViewType).toHaveBeenCalledWith(
                CustomerViewType.CancellableEnforcedLogin,
            );
        });

        it('does not render SuggestedLogin form if Stripe link is authenticated', async () => {
            jest.spyOn(checkoutService.getState().data, 'getCustomer').mockReturnValue({
                ...getCustomer(),
                isGuest: true,
                shouldEncourageSignIn: true,
                isStripeLinkAuthenticated: true,
            } as CustomerData);

            jest.spyOn(checkoutService, 'continueAsGuest').mockReturnValue(
                Promise.resolve(checkoutService.getState()),
            );

            const handleChangeViewType = jest.fn();
            const component = mount(
                <CustomerTest
                    onChangeViewType={handleChangeViewType}
                    viewType={CustomerViewType.Guest}
                />,
            );

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            (component.find(GuestForm) as ReactWrapper<GuestFormProps>).prop('onContinueAsGuest')({
                email: 'test@bigcommerce.com',
                shouldSubscribe: false,
            });

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            expect(handleChangeViewType).not.toHaveBeenCalledWith(CustomerViewType.SuggestedLogin);

            (checkoutService.getState().data.getCustomer as jest.Mock).mockRestore();
        });

        it('renders SuggestedLogin form if continue as guest returns truthy shouldEncourageSignIn', async () => {
            jest.spyOn(checkoutService.getState().data, 'getCustomer').mockReturnValue({
                ...getCustomer(),
                isGuest: true,
                shouldEncourageSignIn: true,
            } as any);

            jest.spyOn(checkoutService, 'continueAsGuest').mockReturnValue(
                Promise.resolve(checkoutService.getState()),
            );

            const handleChangeViewType = jest.fn();
            const handleNewsletterSubscription = jest.fn();
            const component = mount(
                <CustomerTest
                    isSubscribed={true}
                    onChangeViewType={handleChangeViewType}
                    onSubscribeToNewsletter={handleNewsletterSubscription}
                    viewType={CustomerViewType.Guest}
                />,
            );

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            (component.find(GuestForm) as ReactWrapper<GuestFormProps>).prop('onContinueAsGuest')({
                email: 'test@bigcommerce.com',
                shouldSubscribe: false,
            });

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            expect(handleChangeViewType).toHaveBeenCalledWith(CustomerViewType.SuggestedLogin);

            (checkoutService.getState().data.getCustomer as jest.Mock).mockRestore();
        });

        it('renders EnforcedLogin form if continue as guest fails with code 429', async () => {
            jest.spyOn(checkoutService, 'continueAsGuest').mockRejectedValue({
                status: 429,
                type: '',
            });

            const handleChangeViewType = jest.fn();

            const handleNewsletterSubscription = jest.fn();
            const component = mount(
                <CustomerTest
                    isSubscribed={true}
                    onChangeViewType={handleChangeViewType}
                    onSubscribeToNewsletter={handleNewsletterSubscription}
                    viewType={CustomerViewType.Guest}
                />,
            );

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            (component.find(GuestForm) as ReactWrapper<GuestFormProps>).prop('onContinueAsGuest')({
                email: 'test@bigcommerce.com',
                shouldSubscribe: false,
            });

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            expect(handleChangeViewType).toHaveBeenCalledWith(CustomerViewType.EnforcedLogin);
        });

        it('triggers error callback if customer is unable to continue as guest', async () => {
            jest.spyOn(checkoutService, 'continueAsGuest').mockRejectedValue({
                type: 'unknown_error',
            });

            const handleError = jest.fn();
            const component = mount(
                <CustomerTest
                    onContinueAsGuestError={handleError}
                    viewType={CustomerViewType.Guest}
                />,
            );

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            (component.find(GuestForm) as ReactWrapper<GuestFormProps>).prop('onContinueAsGuest')({
                email: 'test@bigcommerce.com',
                shouldSubscribe: false,
            });

            await new Promise((resolve) => process.nextTick(resolve));

            expect(handleError).toHaveBeenCalled();
        });

        it('retains draft email address when switching to login view', async () => {
            const component = mount(<CustomerTest viewType={CustomerViewType.Guest} />);

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            (component.find(GuestForm) as ReactWrapper<GuestFormProps>).prop('onChangeEmail')(
                'test@bigcommerce.com',
            );

            component.setProps({ viewType: CustomerViewType.Login });
            component.update();

            expect((component.find(LoginForm) as ReactWrapper<LoginFormProps>).prop('email')).toBe(
                'test@bigcommerce.com',
            );
        });
    });

    describe('when view type is "login"', () => {
        it('matches snapshot', async () => {
            const component = mount(
                <CustomerTest isAccountCreationEnabled={true} viewType={CustomerViewType.Login} />,
            );

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            expect(component.render()).toMatchSnapshot();
        });

        it('renders login form', async () => {
            const component = mount(<CustomerTest viewType={CustomerViewType.Login} />);

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            expect(component.find(LoginForm).exists()).toBe(true);
        });

        it('renders sign-in email when link is clicked', async () => {
            const component = mount(
                <CustomerTest isSignInEmailEnabled={true} viewType={CustomerViewType.Login} />,
            );

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            expect(component.find(EmailLoginForm).exists()).toBe(false);

            component.find('[data-test="customer-signin-link"]').simulate('click');
            await new Promise((resolve) => process.nextTick(resolve));

            expect(component.find(EmailLoginForm).prop('emailHasBeenRequested')).toBe(false);
        });

        it('does not render sign-in email link when is embedded checkout', async () => {
            const component = mount(
                <CustomerTest
                    isEmbedded={true}
                    isSignInEmailEnabled={true}
                    viewType={CustomerViewType.Login}
                />,
            );

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            expect(component.find(EmailLoginForm).exists()).toBe(false);

            expect(component.find('[data-test="customer-signin-link"]').exists()).toBe(false);
        });

        it('passes data to login form', async () => {
            const component = mount(<CustomerTest viewType={CustomerViewType.Login} />);

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            expect(component.find(LoginForm).props()).toMatchObject({
                email: billingAddress.email,
                canCancel: config.checkoutSettings.guestCheckoutEnabled,
                forgotPasswordUrl: config.links.forgotPasswordLink,
            });
        });

        it('handles "sign in" event', async () => {
            jest.spyOn(checkoutService, 'signInCustomer').mockReturnValue(
                Promise.resolve(checkoutService.getState()),
            );

            const component = mount(<CustomerTest viewType={CustomerViewType.Login} />);

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            (component.find(LoginForm) as ReactWrapper<LoginFormProps>).prop('onSignIn')({
                email: 'test@bigcommerce.com',
                password: 'password1',
            });

            expect(checkoutService.signInCustomer).toHaveBeenCalledWith({
                email: 'test@bigcommerce.com',
                password: 'password1',
            });
        });

        it('triggers completion callback if customer is successfully signed in', async () => {
            jest.spyOn(checkoutService, 'signInCustomer').mockReturnValue(
                Promise.resolve(checkoutService.getState()),
            );

            const handleSignedIn = jest.fn();
            const component = mount(
                <CustomerTest onSignIn={handleSignedIn} viewType={CustomerViewType.Login} />,
            );

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            (component.find(LoginForm) as ReactWrapper<LoginFormProps>).prop('onSignIn')({
                email: 'test@bigcommerce.com',
                password: 'password1',
            });

            await new Promise((resolve) => process.nextTick(resolve));

            expect(handleSignedIn).toHaveBeenCalled();
        });

        it('triggers error callback if customer is unable to sign in', async () => {
            jest.spyOn(checkoutService, 'signInCustomer').mockRejectedValue({
                type: 'unknown_error',
            });

            const handleError = jest.fn();
            const component = mount(
                <CustomerTest onSignInError={handleError} viewType={CustomerViewType.Login} />,
            );

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            (component.find(LoginForm) as ReactWrapper<LoginFormProps>).prop('onSignIn')({
                email: 'test@bigcommerce.com',
                password: 'password1',
            });

            await new Promise((resolve) => process.nextTick(resolve));

            expect(handleError).toHaveBeenCalled();
        });

        it('clears error when "cancel" event is triggered', async () => {
            const error = new Error();

            jest.spyOn(checkoutService.getState().errors, 'getSignInError').mockReturnValue(error);

            jest.spyOn(checkoutService, 'clearError').mockReturnValue(
                Promise.resolve(checkoutService.getState()),
            );

            const component = mount(<CustomerTest viewType={CustomerViewType.Login} />);

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            (component.find(LoginForm) as ReactWrapper<LoginFormProps>).prop('onCancel')!();

            expect(checkoutService.clearError).toHaveBeenCalledWith(error);
        });

        it('changes to guest view when "cancel" event is triggered', async () => {
            const handleChangeViewType = jest.fn();
            const component = mount(
                <CustomerTest
                    onChangeViewType={handleChangeViewType}
                    viewType={CustomerViewType.Login}
                />,
            );

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            (component.find(LoginForm) as ReactWrapper<LoginFormProps>).prop('onCancel')!();

            expect(handleChangeViewType).toHaveBeenCalledWith(CustomerViewType.Guest);
        });

        it('retains draft email address when switching to guest view', async () => {
            const component = mount(<CustomerTest viewType={CustomerViewType.Login} />);

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            (component.find(LoginForm) as ReactWrapper<LoginFormProps>).prop('onChangeEmail')!(
                'test@bigcommerce.com',
            );

            component.setProps({ viewType: CustomerViewType.Guest });
            component.update();

            expect((component.find(GuestForm) as ReactWrapper<GuestFormProps>).prop('email')).toBe(
                'test@bigcommerce.com',
            );
        });
    });

    describe('when view type is "cancellable_enforced_login"', () => {
        it('renders login form', async () => {
            const component = mount(
                <CustomerTest viewType={CustomerViewType.CancellableEnforcedLogin} />,
            );

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            expect(component.find(LoginForm).prop('viewType')).toEqual(
                CustomerViewType.CancellableEnforcedLogin,
            );
        });
    });

    describe('when view type is "suggested_login"', () => {
        it('renders login form', async () => {
            const component = mount(<CustomerTest viewType={CustomerViewType.SuggestedLogin} />);

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            expect(component.find(LoginForm).prop('viewType')).toEqual(
                CustomerViewType.SuggestedLogin,
            );
        });
    });

    describe('when view type is "enforced_login"', () => {
        it('renders login form', async () => {
            const component = mount(<CustomerTest viewType={CustomerViewType.EnforcedLogin} />);

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            expect(component.find(LoginForm).prop('viewType')).toEqual(
                CustomerViewType.EnforcedLogin,
            );
        });

        it('calls sendLoginEmail and renders form when sign-in email link is clicked', async () => {
            const sendLoginEmail = jest.fn(() => new Promise<void>((resolve) => resolve()) as any);
            const component = mount(
                <CustomerTest
                    email="foo@bar.com"
                    isSignInEmailEnabled={true}
                    sendLoginEmail={sendLoginEmail}
                    viewType={CustomerViewType.EnforcedLogin}
                />,
            );

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            component.find('[data-test="customer-signin-link"]').simulate('click');
            component.update();
            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            expect(sendLoginEmail).toHaveBeenCalledWith({ email: 'foo@bar.com' });
            expect(component.find(EmailLoginForm).prop('emailHasBeenRequested')).toBe(true);
        });

        it('renders EmailLoginForm even when sendLoginForm is rejected', async () => {
            const sendLoginEmail = jest.fn(() => new Promise((_, reject) => reject()) as any);
            const component = mount(
                <CustomerTest
                    email="foo@bar.com"
                    isSignInEmailEnabled={true}
                    sendLoginEmail={sendLoginEmail}
                    viewType={CustomerViewType.EnforcedLogin}
                />,
            );

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            component.find('[data-test="customer-signin-link"]').simulate('click');
            component.update();
            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            expect(sendLoginEmail).toHaveBeenCalledWith({ email: 'foo@bar.com' });
            expect(component.find(EmailLoginForm).prop('emailHasBeenRequested')).toBe(true);
        });
    });
});
