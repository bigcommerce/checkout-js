import '@testing-library/jest-dom';

import {
    type Cart,
    type Checkout,
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
    type StoreConfig,
} from '@bigcommerce/checkout-sdk';
import { faker } from '@faker-js/faker';
import userEvent from '@testing-library/user-event';
import React, { type FunctionComponent } from 'react';

import { AnalyticsProviderMock } from '@bigcommerce/checkout/contexts';
import { createLocaleContext, LocaleContext, type LocaleContextType } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';
import { getCart, getCheckout, getStoreConfig } from '@bigcommerce/checkout/test-mocks';
import { render, screen, within } from '@bigcommerce/checkout/test-utils';

import CheckoutStepType from '../checkout/CheckoutStepType';

import Customer, { type CustomerProps } from './Customer';
import CustomerViewType from './CustomerViewType';

describe('Registered Customer', () => {
    let CustomerTest: FunctionComponent<CustomerProps>;
    let checkoutService: CheckoutService;
    let localeContext: LocaleContextType;
    let checkout: Checkout;
    let cart: Cart;
    let config: StoreConfig;
    const defaultProps = {
        isSubscribed: false,
        isWalletButtonsOnTop: false,
        onSubscribeToNewsletter: jest.fn(),
        step: {
            isActive: true,
            isBusy: false,
            isComplete: false,
            isEditable: true,
            isRequired: true,
            type: CheckoutStepType.Customer,
        },
    };

    beforeEach(() => {
        checkoutService = createCheckoutService();
        localeContext = createLocaleContext(getStoreConfig());
        checkout = getCheckout();
        cart = getCart();
        config = getStoreConfig();

        jest.spyOn(checkoutService.getState().data, 'getCheckout').mockReturnValue(checkout);

        jest.spyOn(checkoutService.getState().data, 'getCart').mockReturnValue(cart);

        jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue(config);

        jest.spyOn(checkoutService, 'loadPaymentMethods').mockResolvedValue(
            checkoutService.getState(),
        );

        jest.spyOn(checkoutService, 'initializeCustomer').mockResolvedValue(
            checkoutService.getState(),
        );

        jest.spyOn(checkoutService.getState().data, 'getPaymentMethods').mockReturnValue([]);

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

    it('renders login form and continue as customer', async () => {
        const email = faker.internet.email();
        const password = faker.internet.password();

        jest.spyOn(checkoutService, 'signInCustomer').mockResolvedValue({} as CheckoutSelectors);

        render(<CustomerTest viewType={CustomerViewType.Login} {...defaultProps} />);

        expect(screen.getByTestId('checkout-customer-returning')).toBeInTheDocument();
        expect(screen.getByLabelText(
            localeContext.language.translate('customer.email_label'),
        )).toBeInTheDocument();

        await userEvent.type(screen.getByLabelText(
            localeContext.language.translate('customer.email_label'),
        ), email);

        expect(screen.getByLabelText(
            localeContext.language.translate('customer.password_label'),
        )).toBeInTheDocument();

        await userEvent.type(screen.getByLabelText(
            localeContext.language.translate('customer.password_label'),
        ), password);

        await userEvent.click(screen.getByRole('button', {
            name: localeContext.language.translate('customer.sign_in_action')
        }));

        expect(checkoutService.signInCustomer).toHaveBeenCalledWith({
            email,
            password,
        });
    });

    it('displays error message if invalid email', async () => {
        const password = faker.internet.password();

        jest.spyOn(checkoutService, 'signInCustomer').mockResolvedValue({} as CheckoutSelectors);

        render(<CustomerTest viewType={CustomerViewType.Login} {...defaultProps} />);

        expect(screen.getByTestId('checkout-customer-returning')).toBeInTheDocument();

        const invalidEmail = 'test@test.';
        const emailField = screen.getByLabelText(localeContext.language.translate('customer.email_label'));

        expect(emailField).toBeInTheDocument();
        await userEvent.type(emailField, invalidEmail);
        expect(screen.getByLabelText(
            localeContext.language.translate('customer.password_label'),
        )).toBeInTheDocument();

        await userEvent.type(screen.getByLabelText(
            localeContext.language.translate('customer.password_label'),
        ), password);

        await userEvent.click(screen.getByRole('button', {
            name: localeContext.language.translate('customer.sign_in_action')
        }));

        expect(screen.getByText(localeContext.language.translate('customer.email_invalid_error'))).toBeInTheDocument();
        expect(checkoutService.signInCustomer).not.toHaveBeenCalled();
    });

    it('displays error message if password is missing', async () => {
        const email = faker.internet.email();

        jest.spyOn(checkoutService, 'signInCustomer').mockResolvedValue({} as CheckoutSelectors);

        render(<CustomerTest viewType={CustomerViewType.Login} {...defaultProps} />);

        expect(screen.getByTestId('checkout-customer-returning')).toBeInTheDocument();
        expect(screen.getByLabelText(
            localeContext.language.translate('customer.email_label')
        )).toBeInTheDocument();

        await userEvent.type(screen.getByLabelText(
            localeContext.language.translate('customer.email_label')
        ), email);

        await userEvent.click(screen.getByRole('button', {
            name: localeContext.language.translate('customer.sign_in_action')
        }));

        expect(screen.getByText(localeContext.language.translate('customer.password_required_error'))).toBeInTheDocument();
        expect(checkoutService.signInCustomer).not.toHaveBeenCalled();
    });

    it('displays error message if customer is not able to sign in and clears error when cancel is triggered', async () => {
        const error = Object.assign(new Error(), { body: { type: 'invalid login' } });

        jest.spyOn(checkoutService, 'signInCustomer').mockRejectedValue({
            type: 'unknown_error',
        });
        jest.spyOn(checkoutService.getState().errors, 'getSignInError').mockReturnValue(error);
        jest.spyOn(checkoutService, 'clearError').mockReturnValue(
            Promise.resolve(checkoutService.getState()),
        );

        const email = faker.internet.email();
        const password = faker.internet.password();

        render(<CustomerTest viewType={CustomerViewType.Login} {...defaultProps} />);

        expect(screen.getByTestId('checkout-customer-returning')).toBeInTheDocument();
        expect(screen.getByLabelText(
            localeContext.language.translate('customer.email_label'),
        )).toBeInTheDocument();

        await userEvent.type(screen.getByLabelText(
            localeContext.language.translate('customer.email_label'),
        ), email);

        expect(screen.getByLabelText(
            localeContext.language.translate('customer.password_label'),
        )).toBeInTheDocument();

        await userEvent.type(screen.getByLabelText(
            localeContext.language.translate('customer.password_label'),
        ), password);

        await userEvent.click(screen.getByRole('button', {
            name: localeContext.language.translate('customer.sign_in_action')
        }));

        expect(checkoutService.signInCustomer).toHaveBeenCalledWith({
            email,
            password,
        });
        expect(screen.getByText(localeContext.language.translate('customer.sign_in_error'))).toBeInTheDocument();

        const cancelButton = screen.getByRole('link', { name: localeContext.language.translate('common.cancel_action') });

        await userEvent.click(cancelButton);

        expect(checkoutService.clearError).toHaveBeenCalledWith(error);
    });

    it('renders cancel button and changes to guest view when "cancel" event is triggered', async () => {
        const handleChangeViewType = jest.fn();
        const email = faker.internet.email();

        const { rerender } = render(<CustomerTest viewType={CustomerViewType.Login} {...defaultProps} onChangeViewType={handleChangeViewType} />);

        expect(screen.getByLabelText(
            localeContext.language.translate('customer.email_label'),
        )).toBeInTheDocument();

        await userEvent.type(screen.getByLabelText(
            localeContext.language.translate('customer.email_label'),
        ), email);

        const cancelButton = screen.getByRole('link', { name: localeContext.language.translate('common.cancel_action') });

        expect(cancelButton).toBeInTheDocument();

        await userEvent.click(cancelButton);

        expect(handleChangeViewType).toHaveBeenCalledWith(CustomerViewType.Guest);

        rerender(<CustomerTest viewType={CustomerViewType.Guest} {...defaultProps} onChangeViewType={handleChangeViewType} />);

        expect(screen.getByTestId('checkout-customer-guest')).toBeInTheDocument();
        expect(screen.getByLabelText(localeContext.language.translate('customer.email_label'))).toHaveValue(email);
    });

    it('verify forget password link', async () => {
        render(<CustomerTest viewType={CustomerViewType.Login} {...defaultProps} />);

        const forgotPasswordLink = screen.getByText(localeContext.language.translate('customer.forgot_password_action'));

        expect(forgotPasswordLink).toBeInTheDocument();
        expect(forgotPasswordLink).toHaveAttribute('href', config.links.forgotPasswordLink);
    });

    it('does not display sign in link anchor tag', async () => {
        render(<CustomerTest viewType={CustomerViewType.Login} {...defaultProps} />);

        expect(screen.queryByText(localeContext.language.translate('login_email.text'))).not.toBeInTheDocument();
    });

    it('displays an error if email is not registered for a sign in link', async () => {
        jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue({
            ...config,
            checkoutSettings: { ...config.checkoutSettings, isSignInEmailEnabled: true }
        });
        jest.spyOn(checkoutService, 'sendSignInEmail').mockRejectedValue({
            type: 'unknown_error',
        });

        const error = Object.assign(new Error(), { status: 404 });

        jest.spyOn(checkoutService.getState().errors, 'getSignInEmailError').mockReturnValue(error);

        render(<CustomerTest viewType={CustomerViewType.Login} {...defaultProps} />);

        const signInLinkButton = screen.getByTestId('customer-signin-link');

        await userEvent.click(signInLinkButton);

        expect(screen.getByText(localeContext.language.translate('login_email.text'))).toBeInTheDocument();

        const modal = screen.getByTestId("modal-body");

        expect(modal).toBeInTheDocument();

        // @ts-ignore
        const modalEmailInput = within(modal).getByRole('textbox', { id: 'email' });
        const email = faker.internet.email();

        await userEvent.type(modalEmailInput, email);

        const submitButton = screen.getByRole('button', { name: /send/i });

        await userEvent.click(submitButton);

        expect(screen.getByText(localeContext.language.translate('login_email.error_not_found'))).toBeInTheDocument();
    });

    it('displays an error if there is a server error for a sign in link', async () => {
        jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue({
            ...config,
            checkoutSettings: { ...config.checkoutSettings, isSignInEmailEnabled: true }
        });
        jest.spyOn(checkoutService, 'sendSignInEmail').mockRejectedValue({
            type: 'unknown_error',
        });

        const error = Object.assign(new Error(), { status: 422 });

        jest.spyOn(checkoutService.getState().errors, 'getSignInEmailError').mockReturnValue(error);

        render(<CustomerTest viewType={CustomerViewType.Login} {...defaultProps} />);

        const signInLinkButton = screen.getByTestId('customer-signin-link');

        await userEvent.click(signInLinkButton);

        expect(screen.getByText(localeContext.language.translate('login_email.text'))).toBeInTheDocument();

        const modal = screen.getByTestId("modal-body");

        expect(modal).toBeInTheDocument();

        // @ts-ignore
        const modalEmailInput = within(modal).getByRole('textbox', { id: 'email' });
        const email = faker.internet.email();

        await userEvent.type(modalEmailInput, email);

        const submitButton = screen.getByRole('button', { name: /send/i });

        await userEvent.click(submitButton);

        expect(screen.getByText(localeContext.language.translate('login_email.error_server'))).toBeInTheDocument();
    });

    it('displays message to check email if customer is registered and sign in link is clicked', async () => {
        jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue({
            ...config,
            checkoutSettings: { ...config.checkoutSettings, isSignInEmailEnabled: true }
        });
        jest.spyOn(checkoutService, 'sendSignInEmail').mockResolvedValue({} as CheckoutSelectors);
        jest.spyOn(checkoutService.getState().data, 'getSignInEmail').mockReturnValue({
            sent_email: 'sign_in',
            expiry: 900,
        });

        render(<CustomerTest viewType={CustomerViewType.Login} {...defaultProps} />);

        const signInLinkButton = screen.getByTestId('customer-signin-link');

        await userEvent.click(signInLinkButton);

        expect(screen.getByText(localeContext.language.translate('login_email.text'))).toBeInTheDocument();

        const modal = screen.getByTestId("modal-body");

        expect(modal).toBeInTheDocument();

        // @ts-ignore
        const modalEmailInput = within(modal).getByRole('textbox', { id: 'email' });
        const email = faker.internet.email();

        await userEvent.type(modalEmailInput, email);

        const submitButton = screen.getByRole('button', { name: /send/i });

        await userEvent.click(submitButton);

        expect(screen.getByText(localeContext.language.translate('login_email.sent_text'))).toBeInTheDocument();
    });

    it('displays message to reset password if customer is registered and sign in link request is made too many times', async () => {
        jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue({
            ...config,
            checkoutSettings: { ...config.checkoutSettings, isSignInEmailEnabled: true }
        });
        jest.spyOn(checkoutService, 'sendSignInEmail').mockResolvedValue({} as CheckoutSelectors);
        jest.spyOn(checkoutService.getState().data, 'getSignInEmail').mockReturnValue({
            sent_email: 'reset_password',
            expiry: -2,
        });

        render(<CustomerTest viewType={CustomerViewType.Login} {...defaultProps} />);

        const signInLinkButton = screen.getByTestId('customer-signin-link');

        await userEvent.click(signInLinkButton);

        expect(screen.getByText(localeContext.language.translate('login_email.text'))).toBeInTheDocument();

        const modal = screen.getByTestId("modal-body");

        expect(modal).toBeInTheDocument();

        // @ts-ignore
        const modalEmailInput = within(modal).getByRole('textbox', { id: 'email' });
        const email = faker.internet.email();

        await userEvent.type(modalEmailInput, email);

        const submitButton = screen.getByRole('button', { name: /send/i });

        await userEvent.click(submitButton);

        expect(screen.getByText(localeContext.language.translate('customer.reset_password_before_login_error'))).toBeInTheDocument();
    });

    it('does not render sign-in email link in embedded checkout', () => {
        render(
            <CustomerTest
                {...defaultProps}
                isEmbedded={true}
                isSignInEmailEnabled={true}
                viewType={CustomerViewType.Login}
            />,
        );

        expect(screen.queryByTestId('customer-signin-link')).not.toBeInTheDocument();
    });

    it('changes from guest to login view and no passwordless login is displayed for buy now cart', async () => {
        const buyNowCheckout = {
            ...getCheckout(),
            cart: {
                ...getCheckout().cart,
                source: 'BUY_NOW',
            }
        };

        jest.spyOn(checkoutService.getState().data, 'getCheckout').mockReturnValue(buyNowCheckout);

        render(<CustomerTest viewType={CustomerViewType.Login} {...defaultProps} />);    

        expect(screen.queryByText(localeContext.language.translate('login_email.link'))).not.toBeInTheDocument();
    });
});
