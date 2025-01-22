import '@testing-library/jest-dom';
import {
    Cart,
    Checkout,
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
    Customer as CustomerData,
    StoreConfig,
} from '@bigcommerce/checkout-sdk';
import faker from '@faker-js/faker';
import userEvent from '@testing-library/user-event';
import { c } from 'msw/lib/glossary-2792c6da';
import React, { FunctionComponent } from 'react';

import { AnalyticsProviderMock } from '@bigcommerce/checkout/analytics';
import { createLocaleContext, LocaleContext, LocaleContextType } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';
import { render, screen, waitFor, within } from '@bigcommerce/checkout/test-utils';

import { getBillingAddress } from '../billing/billingAddresses.mock';
import { getCart } from '../cart/carts.mock';
import { getCheckout } from '../checkout/checkouts.mock';
import { getStoreConfig } from '../config/config.mock';

import Customer, { CustomerProps, WithCheckoutCustomerProps } from './Customer';
import { getGuestCustomer } from './customers.mock';
import CustomerViewType from './CustomerViewType';

describe('Customer Guest', () => {
    let CustomerTest: FunctionComponent<CustomerProps & Partial<WithCheckoutCustomerProps>>;
    let checkoutService: CheckoutService;
    let localeContext: LocaleContextType;
    let checkout: Checkout;
    let cart: Cart;
    let config: StoreConfig;
    let customer: CustomerData;
    const defaultProps = {
        isSubscribed: false,
        isWalletButtonsOnTop: false,
        onSubscribeToNewsletter: jest.fn(),
        step: {} as CheckoutStepStatus,
    };

    beforeEach(() => {
        checkoutService = createCheckoutService();
        localeContext = createLocaleContext(getStoreConfig());
        checkout = getCheckout();
        cart = getCart();
        customer = getGuestCustomer();
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

    it('renders guest form and continue as guest', async () => {
        const email = faker.internet.email();

        jest.spyOn(checkoutService, 'continueAsGuest').mockResolvedValue({} as CheckoutSelectors);

        render(<CustomerTest viewType={CustomerViewType.Guest} {...defaultProps} />);

        expect(screen.getByTestId('checkout-customer-guest')).toBeInTheDocument();
        expect(screen.getByLabelText(
            localeContext.language.translate('customer.email_label'),
        )).toBeInTheDocument();

        await userEvent.type(screen.getByLabelText(
            localeContext.language.translate('customer.email_label'),
        ), email);

        await userEvent.click(screen.getByRole('button', {
            name: localeContext.language.translate('customer.continue')
        }));

        expect(checkoutService.continueAsGuest).toHaveBeenCalledWith({
            email,
        });
    });

    it('displays error message if email is not valid', async () => {
        jest.spyOn(checkoutService, 'continueAsGuest').mockResolvedValue({} as CheckoutSelectors);

        render(<CustomerTest viewType={CustomerViewType.Guest} {...defaultProps} />);

        expect(screen.getByTestId('checkout-customer-guest')).toBeInTheDocument();

        const invalidEmail = 'test@test.';
        const emailField = screen.getByLabelText(localeContext.language.translate('customer.email_label'));

        expect(emailField).toBeInTheDocument();
        await userEvent.type(emailField, invalidEmail);

        await userEvent.click(screen.getByRole('button', {
            name: localeContext.language.translate('customer.continue')
        }));

        expect(screen.getByLabelText(localeContext.language.translate('customer.email_invalid_error'))).toBeInTheDocument();

        expect(checkoutService.continueAsGuest).not.toHaveBeenCalled();

        const email = faker.internet.email();

        await userEvent.clear(emailField);
        await userEvent.type(emailField, email);

        await userEvent.click(screen.getByRole('button', {
            name: localeContext.language.translate('customer.continue')
        }));

        expect(checkoutService.continueAsGuest).toHaveBeenCalledWith({
            email,
        });
    });

    it('displays error message if privacy policy is required and not checked', async () => {
        const email = faker.internet.email();

        jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue({
            ...config,
            checkoutSettings: {
                ...config.checkoutSettings,
                privacyPolicyUrl: 'foo',
            },
        });
        jest.spyOn(checkoutService, 'continueAsGuest').mockResolvedValue({} as CheckoutSelectors);

        render(<CustomerTest viewType={CustomerViewType.Guest} {...defaultProps} />);

        expect(screen.getByTestId('checkout-customer-guest')).toBeInTheDocument();
        expect(screen.getByLabelText(
            localeContext.language.translate('customer.email_label'),
        )).toBeInTheDocument();

        await userEvent.type(screen.getByLabelText(
            localeContext.language.translate('customer.email_label'),
        ), email);

        await userEvent.click(screen.getByRole('button', {
            name: localeContext.language.translate('customer.continue')
        }));

        expect(screen.getByLabelText(localeContext.language.translate('privacy_policy.required_error'))).toBeInTheDocument();

        expect(checkoutService.continueAsGuest).not.toHaveBeenCalled();

        const link = screen.getByText('privacy policy');

        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', 'foo');

        expect(screen.getByTestId('privacy-policy-checkbox')).toBeInTheDocument();
        await userEvent.click(screen.getByTestId('privacy-policy-checkbox'));

        await userEvent.click(screen.getByRole('button', {
            name: localeContext.language.translate('customer.continue')
        }));

        expect(checkoutService.continueAsGuest).toHaveBeenCalledWith({
            email,
        });

    });

    it('checks subscribe to news letter and continue as guest', async () => {
        const email = faker.internet.email();

        jest.spyOn(checkoutService, 'continueAsGuest').mockResolvedValue({} as CheckoutSelectors);

        render(<CustomerTest viewType={CustomerViewType.Guest} {...defaultProps} />);

        const emailField = screen.getByLabelText(localeContext.language.translate('customer.email_label'));

        await userEvent.type(emailField, email);

        const subscribeCheckbox = screen.getByLabelText(
            localeContext.language.translate('customer.guest_subscribe_to_newsletter_text'),
        );

        await userEvent.click(subscribeCheckbox);

        await userEvent.click(screen.getByRole('button', {
            name: localeContext.language.translate('customer.continue')
        }));

        expect(checkoutService.continueAsGuest).toHaveBeenCalledWith({
            email,
            acceptsAbandonedCartEmails: true,
            acceptsMarketingNewsletter: true,
        });
    });
});