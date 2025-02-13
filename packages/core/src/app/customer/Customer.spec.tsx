import {
    BillingAddress,
    Cart,
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
import { getCart } from '../cart/carts.mock';
import { getCheckout } from '../checkout/checkouts.mock';
import CheckoutStepStatus from '../checkout/CheckoutStepStatus';
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
    let cart: Cart;
    let checkoutService: CheckoutService;
    let config: StoreConfig;
    let configStripeUpe: StoreConfig;
    let customer: CustomerData;
    let localeContext: LocaleContextType;
    const defaultProps = {
        isSubscribed: false,
        isWalletButtonsOnTop: false,
        onSubscribeToNewsletter: jest.fn(),
        step:{} as CheckoutStepStatus,
    };

    beforeEach(() => {
        billingAddress = getBillingAddress();
        checkout = getCheckout();
        cart = getCart();
        customer = getGuestCustomer();
        config = getStoreConfig();
        configStripeUpe = {
            ...config,
            checkoutSettings: {
                ...config.checkoutSettings,
                providerWithCustomCheckout: PaymentMethodId.StripeUPE,
            }
        }

        checkoutService = createCheckoutService();

        jest.spyOn(checkoutService.getState().data, 'getBillingAddress').mockReturnValue(
            billingAddress,
        );

        jest.spyOn(checkoutService.getState().data, 'getCheckout').mockReturnValue(checkout);

        jest.spyOn(checkoutService.getState().data, 'getCart').mockReturnValue(cart);

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
            const component = mount(<CustomerTest
                viewType={CustomerViewType.Guest} {...defaultProps} />);

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            expect(component.render()).toMatchSnapshot();
        });

        it('renders guest form by default', async () => {
            const component = mount(<CustomerTest viewType={CustomerViewType.Guest} {...defaultProps} />);

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            expect(component.find(GuestForm).exists()).toBe(true);
        });

        it('renders guest form in loading state if the payment method is executing', async () => {
            const component = mount(
                <CustomerTest
                    {...defaultProps}
                    isExecutingPaymentMethodCheckout={true}
                    viewType={CustomerViewType.Guest}
                />
            );

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            expect(component.find(GuestForm).props()).toMatchObject({
                isLoading: true,
            });
        });

        it('renders guest form in loading state if there is a process running before switching to the next step', async () => {
            const component = mount(
                <CustomerTest
                    {...defaultProps}
                    isContinuingAsGuest={true}
                    isExecutingPaymentMethodCheckout={false}
                    viewType={CustomerViewType.Guest}
                />
            );

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            expect(component.find(GuestForm).props()).toMatchObject({
                isLoading: true,
            });
        });

        it('renders stripe guest form if enabled', async () => {
            const steps = { isActive: true,
                isComplete: true,
                isEditable: true,
                isRequired: true,
                isBusy: false,
                type: CheckoutStepType.Customer };

            jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue(configStripeUpe);

            const component = mount(
                <CustomerTest {...defaultProps} step={ steps } viewType={ CustomerViewType.Guest } />
            );

            await new Promise(resolve => process.nextTick(resolve));
            component.update();

            expect(component.find(StripeGuestForm).exists()).toBe(true);
        });

        it("doesn't render Stripe guest form if it enabled but cart amount is smaller then Stripe requires", async () => {
            jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue(configStripeUpe);
            jest.spyOn(checkoutService.getState().data, 'getCart').mockReturnValue({
                ...cart,
                cartAmount: 0.4,
            });

            const steps = { isActive: true,
                isComplete: true,
                isEditable: true,
                isRequired: true,
                isBusy: false,
                type: CheckoutStepType.Customer };

            const component = mount(
                <CustomerTest {...defaultProps}  step={ steps } viewType={ CustomerViewType.Guest } />
            );

            await new Promise(resolve => process.nextTick(resolve));
            component.update();

            expect(component.find(StripeGuestForm).exists()).toBe(false);
            expect(component.find(GuestForm).exists()).toBe(true);
        });

        it('calls onUnhandledError if initialize was failed', async () => {
            jest.spyOn(checkoutService, 'initializeCustomer').mockRejectedValue(new Error());

            const unhandledError = jest.fn();

            mount(<CustomerTest {...defaultProps} onUnhandledError={ unhandledError } providerWithCustomCheckout='bolt' viewType={ CustomerViewType.Guest } />);
            await new Promise(resolve => process.nextTick(resolve));

            expect(unhandledError).toHaveBeenCalledWith(expect.any(Error));
        });

        it('calls onUnhandledError if deinitialize was failed', async () => {
            jest.spyOn(checkoutService, 'deinitializeCustomer').mockRejectedValue(new Error());

            const unhandledError = jest.fn();

            const component = mount(<CustomerTest {...defaultProps} onUnhandledError={ unhandledError } viewType={ CustomerViewType.Guest }/>);

            await new Promise(resolve => process.nextTick(resolve));
            component.unmount();
            await new Promise(resolve => process.nextTick(resolve));

            expect(unhandledError).toHaveBeenCalled();
        });

        it('renders guest form if billing address is undefined', async () => {
            jest.spyOn(checkoutService.getState().data, 'getBillingAddress').mockReturnValue(
                undefined,
            );

            const component = mount(<CustomerTest  {...defaultProps}viewType={CustomerViewType.Guest} />);

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            expect(component.find(GuestForm).exists()).toBe(true);
        });

        it('renders guest form if customer is undefined', async () => {
            jest.spyOn(checkoutService.getState().data, 'getCustomer').mockReturnValue(undefined);

            const component = mount(<CustomerTest {...defaultProps} viewType={CustomerViewType.Guest} />);

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
                },
            });

            const component = mount(<CustomerTest {...defaultProps} viewType={CustomerViewType.CreateAccount} />);

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            expect(component.find(CreateAccountForm).exists()).toBe(true);
        });

        it('passes data to guest form', async () => {
            const component = mount(<CustomerTest {...defaultProps} isSubscribed={false} viewType={CustomerViewType.Guest} />);

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
                {...defaultProps}
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
                {...defaultProps}
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
                    {...defaultProps}
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
                    {...defaultProps}
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
                    {...defaultProps}
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

        it('triggers error callback if customer is unable to continue as guest', async () => {
            jest.spyOn(checkoutService, 'continueAsGuest').mockRejectedValue({
                type: 'unknown_error',
            });

            const handleError = jest.fn();
            const component = mount(
                <CustomerTest
                    {...defaultProps}
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
            const component = mount(<CustomerTest {...defaultProps} viewType={CustomerViewType.Guest} />);

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
        it('renders sign-in email when link is clicked', async () => {
            const component = mount(
                <CustomerTest {...defaultProps} isSignInEmailEnabled={true} viewType={CustomerViewType.Login} />,
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
                <CustomerTest {...defaultProps}
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
    });
});
