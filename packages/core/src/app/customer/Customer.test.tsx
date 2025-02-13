import {
    Checkout as CheckoutObject,
    CheckoutService,
    createCheckoutService,
    createEmbeddedCheckoutMessenger,
    EmbeddedCheckoutMessenger,
} from '@bigcommerce/checkout-sdk';
import faker from '@faker-js/faker';
import userEvent from '@testing-library/user-event';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import {
    AnalyticsContextProps,
    AnalyticsEvents,
    AnalyticsProviderMock,
} from '@bigcommerce/checkout/analytics';
import { ExtensionProvider } from '@bigcommerce/checkout/checkout-extension';
import { getLanguageService, LocaleProvider } from '@bigcommerce/checkout/locale';
import {
    CHECKOUT_ROOT_NODE_ID,
    CheckoutProvider,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    CheckoutPageNodeObject,
    CheckoutPreset,
    checkoutWithBillingEmail,
    checkoutWithMultiShippingCart,
} from '@bigcommerce/checkout/test-framework';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import Checkout, { CheckoutProps } from '../checkout/Checkout';
import { createErrorLogger } from '../common/error';
import {
    createEmbeddedCheckoutStylesheet,
    createEmbeddedCheckoutSupport,
} from '../embeddedCheckout';

describe('Customer Component', () => {
    let checkout: CheckoutPageNodeObject;
    let CheckoutTest: FunctionComponent<CheckoutProps>;
    let checkoutService: CheckoutService;
    let defaultProps: CheckoutProps & AnalyticsContextProps;
    let embeddedMessengerMock: EmbeddedCheckoutMessenger;
    let analyticsTracker: AnalyticsEvents;

    beforeAll(() => {
        checkout = new CheckoutPageNodeObject();
        checkout.goto();
    });

    afterEach(() => {
        checkout.resetHandlers();
    });

    afterAll(() => {
        checkout.close();
    });

    beforeEach(() => {
        window.scrollTo = jest.fn();

        checkoutService = createCheckoutService();
        embeddedMessengerMock = createEmbeddedCheckoutMessenger({
            parentOrigin: 'https://store.url',
        });
        analyticsTracker = {
            checkoutBegin: jest.fn(),
            trackStepCompleted: jest.fn(),
            trackStepViewed: jest.fn(),
            orderPurchased: jest.fn(),
            customerEmailEntry: jest.fn(),
            customerSuggestionInit: jest.fn(),
            customerSuggestionExecute: jest.fn(),
            customerPaymentMethodExecuted: jest.fn(),
            showShippingMethods: jest.fn(),
            selectedPaymentMethod: jest.fn(),
            clickPayButton: jest.fn(),
            paymentRejected: jest.fn(),
            paymentComplete: jest.fn(),
            exitCheckout: jest.fn(),
            walletButtonClick: jest.fn(),
        };
        defaultProps = {
            checkoutId: 'x',
            containerId: CHECKOUT_ROOT_NODE_ID,
            createEmbeddedMessenger: () => embeddedMessengerMock,
            embeddedStylesheet: createEmbeddedCheckoutStylesheet(),
            embeddedSupport: createEmbeddedCheckoutSupport(getLanguageService()),
            errorLogger: createErrorLogger(),
            analyticsTracker,
        };

        jest.spyOn(defaultProps.errorLogger, 'log').mockImplementation(noop);

        CheckoutTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleProvider checkoutService={checkoutService}>
                    <AnalyticsProviderMock>
                        <ExtensionProvider
                            checkoutService={checkoutService}
                            errorLogger={{
                                log: jest.fn(),
                            }}
                        >
                            <Checkout {...props} />
                        </ExtensionProvider>
                    </AnalyticsProviderMock>
                </LocaleProvider>
            </CheckoutProvider>
        );
    });

    it('edit guest customer email', async () => {
        checkout.use(CheckoutPreset.CheckoutWithBillingEmail);

        render(<CheckoutTest {...defaultProps} />);

        await checkout.waitForShippingStep();

        expect(screen.getByText('test@example.com')).toBeInTheDocument();

        await userEvent.click(
            screen.getByRole('button', {
                name: 'Edit',
            }),
        );

        await checkout.waitForCustomerStep();

        const newEmail = faker.internet.email();

        await userEvent.click(screen.getByTestId('should-subscribe-checkbox'));
        await userEvent.clear(await screen.findByLabelText('Email'));
        await userEvent.type(await screen.findByLabelText('Email'), newEmail);

        checkout.updateCheckout(
            'put',
            '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/billing-address/billing-address-id',
            {
                ...checkoutWithBillingEmail,
                billingAddress: {
                    ...checkoutWithBillingEmail.billingAddress,
                    email: newEmail,
                },
            } as CheckoutObject,
        );

        await userEvent.click(await screen.findByText('Continue'));

        expect(screen.getByText(newEmail)).toBeInTheDocument();
    });

    it('creates a new customer', async () => {
        // ✅cancel form
        // ✅renders all fields based on formFields(Rendering custom form field creates a formik warning)
        // ✅check password strength
        // ✅create customer

        const customerEmail = faker.internet.email();

        checkout.use(CheckoutPreset.CheckoutWithDigitalCart);

        render(<CheckoutTest {...defaultProps} />);

        await checkout.waitForCustomerStep();

        await userEvent.click(screen.getByText('Sign in now'));
        await userEvent.click(screen.getByText('Create an account'));
        await userEvent.click(screen.getByText('Cancel'));
        await userEvent.click(screen.getByText('Create an account'));
        await userEvent.type(await screen.findByLabelText('First Name'), faker.name.firstName());
        await userEvent.type(await screen.findByLabelText('Last Name'), faker.name.lastName());
        await userEvent.type(await screen.findByLabelText('Email'), customerEmail);
        await userEvent.type(await screen.findByLabelText('Password'), 'abc');
        await userEvent.click(screen.getByText('Create Account'));

        expect(await screen.findByText('Password needs to contain a number')).toBeInTheDocument();

        await userEvent.type(await screen.findByLabelText('Password'), '123');
        await userEvent.click(screen.getByText('Create Account'));

        expect(await screen.findByText('Password is too short')).toBeInTheDocument();

        checkout.updateCheckout('get', '/checkout/*', {
            ...checkoutWithBillingEmail,
            billingAddress: {
                id: 'xx',
                firstName: '',
                lastName: '',
                email: customerEmail,
                company: '',
                address1: '',
                address2: '',
                city: '',
                shouldSaveAddress: false,
                stateOrProvince: '',
                stateOrProvinceCode: '',
                country: '',
                countryCode: '',
                postalCode: '',
                phone: '',
                customFields: [],
            },
            customer: checkoutWithMultiShippingCart.customer,
        });

        await userEvent.type(await screen.findByLabelText('Password'), 'makeItLonger');
        await userEvent.click(screen.getByTestId('field_30-text'));
        await userEvent.tab();

        expect(screen.getByText('Referral Code is required')).toBeInTheDocument();

        await userEvent.type(await screen.findByLabelText('Referral Code'), 'bigcommerce');
        await userEvent.click(screen.getByText('Create Account'));

        expect(await screen.findByText(customerEmail)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Sign Out' })).toBeInTheDocument();
    });
    
    it('changes from guest to login view and logs in', async () => {
        const email = faker.internet.email();
        const password = faker.internet.password();

        checkout.use(CheckoutPreset.CheckoutWithDigitalCart);

        render(<CheckoutTest {...defaultProps} />);

        await checkout.waitForCustomerStep();

        await userEvent.type(await screen.findByLabelText('Email'), email);
        await userEvent.click(await screen.findByText('Sign in now'));

        // eslint-disable-next-line jest-dom/prefer-to-have-attribute
        expect(screen.getByLabelText('Email').getAttribute('value')).toBe(email);

        await userEvent.type(await screen.findByLabelText('Password'), password);

        checkout.updateCheckout(
            'get',
            '/checkout/*',
            {
                ...checkoutWithBillingEmail,
                billingAddress: {
                    ...checkoutWithBillingEmail.billingAddress,
                    email,
                },
                customer: checkoutWithMultiShippingCart.customer,
            } as CheckoutObject,
        );

        await userEvent.click(await screen.findByText('Sign In'));

        await checkout.waitForShippingStep();

        expect(await screen.findByText(email)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Sign Out' })).toBeInTheDocument();
    });
});
