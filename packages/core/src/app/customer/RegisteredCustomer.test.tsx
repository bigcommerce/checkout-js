import '@testing-library/jest-dom';
import {
    Cart,
    Checkout,
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
    StoreConfig,
} from '@bigcommerce/checkout-sdk';
import faker from '@faker-js/faker';
import userEvent from '@testing-library/user-event';
import React, { FunctionComponent } from 'react';

import { AnalyticsProviderMock } from '@bigcommerce/checkout/analytics';
import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';
import { getCart, getCheckout, getStoreConfig } from '@bigcommerce/checkout/test-mocks';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import CheckoutStepType from '../checkout/CheckoutStepType';

import Customer, { CustomerProps, WithCheckoutCustomerProps } from './Customer';
import CustomerViewType from './CustomerViewType';

describe('Registered Customer', () => {
    let CustomerTest: FunctionComponent<CustomerProps & Partial<WithCheckoutCustomerProps>>;
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
        const password = faker.internet.password();

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
        expect(forgotPasswordLink).toHaveAttribute('href', config.links.forgotPassword);
    });
});
