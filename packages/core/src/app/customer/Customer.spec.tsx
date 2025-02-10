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
        it('renders stripe guest form if enabled', async () => {
            const steps = {
                isActive: true,
                isComplete: true,
                isEditable: true,
                isRequired: true,
                isBusy: false,
                type: CheckoutStepType.Customer
            };

            jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue(configStripeUpe);

            const component = mount(
                <CustomerTest {...defaultProps} step={steps} viewType={CustomerViewType.Guest} />
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

        it('renders CancellableEnforcedLogin if continue as guest fails with code 403', async () => {
            jest.spyOn(checkoutService, 'continueAsGuest').mockRejectedValue({
                status: 403,
                type: '',
            });

            const handleChangeViewType = jest.fn();
            const handleNewsletterSubscription = jest.fn();
            const component = mount(
                <CustomerTest
                    {...defaultProps}
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
            } as CustomerData);

            jest.spyOn(checkoutService, 'continueAsGuest').mockReturnValue(
                Promise.resolve(checkoutService.getState()),
            );
            jest.spyOn(
                checkoutService.getState().data,
                'getPaymentProviderCustomer',
            ).mockReturnValue({ stripeLinkAuthenticationState: true });

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
                    {...defaultProps}
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
                    {...defaultProps}
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

    describe('when view type is "cancellable_enforced_login"', () => {
        it('renders login form', async () => {
            const component = mount(
                <CustomerTest {...defaultProps} viewType={CustomerViewType.CancellableEnforcedLogin} />,
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
            const component = mount(<CustomerTest {...defaultProps} viewType={CustomerViewType.SuggestedLogin} />);

            await new Promise((resolve) => process.nextTick(resolve));
            component.update();

            expect(component.find(LoginForm).prop('viewType')).toEqual(
                CustomerViewType.SuggestedLogin,
            );
        });
    });

    describe('when view type is "enforced_login"', () => {
        it('renders login form', async () => {
            const component = mount(<CustomerTest {...defaultProps} viewType={CustomerViewType.EnforcedLogin} />);

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
                    {...defaultProps}
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
                    {...defaultProps}
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
