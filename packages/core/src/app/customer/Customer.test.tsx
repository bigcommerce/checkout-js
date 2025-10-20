
import {
    type BillingAddress,
    type Cart,
    type Checkout as CheckoutObject,
    type CheckoutService,
    createCheckoutService,
    createEmbeddedCheckoutMessenger,
    type Customer as CustomerData,
    type EmbeddedCheckoutMessenger,
    type StoreConfig,
} from '@bigcommerce/checkout-sdk';
import { faker } from '@faker-js/faker';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import React, { act, type FunctionComponent } from 'react';

import { ExtensionProvider } from '@bigcommerce/checkout/checkout-extension';
import {
    type AnalyticsContextProps,
    type AnalyticsEvents,
    AnalyticsProviderMock,
 ThemeProvider } from '@bigcommerce/checkout/contexts';
import {
    createLocaleContext,
    getLanguageService,
    LocaleContext,
    type LocaleContextType,
    LocaleProvider,
} from '@bigcommerce/checkout/locale';
import {
    CHECKOUT_ROOT_NODE_ID,
    CheckoutProvider,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    CheckoutPageNodeObject,
    CheckoutPreset,
    checkoutSettings,
    checkoutWithBillingEmail,
    checkoutWithMultiShippingCart,
} from '@bigcommerce/checkout/test-framework';
import { renderWithoutWrapper as render, screen } from '@bigcommerce/checkout/test-utils';

import { getBillingAddress } from '../billing/billingAddresses.mock';
import { getCart } from '../cart/carts.mock';
import Checkout, { type CheckoutProps } from '../checkout/Checkout';
import { getCheckout } from '../checkout/checkouts.mock';
import type CheckoutStepStatus from '../checkout/CheckoutStepStatus';
import CheckoutStepType from '../checkout/CheckoutStepType';
import { createErrorLogger } from '../common/error';
import { getStoreConfig } from '../config/config.mock';
import {
    createEmbeddedCheckoutStylesheet,
    createEmbeddedCheckoutSupport,
} from '../embeddedCheckout';
import { PaymentMethodId } from '../payment/paymentMethod';

import Customer, { type CustomerProps } from './Customer';
import { getGuestCustomer } from './customers.mock';
import CustomerViewType from './CustomerViewType';

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
                            <ThemeProvider>
                                <Checkout {...props} />
                            </ThemeProvider>
                        </ExtensionProvider>
                    </AnalyticsProviderMock>
                </LocaleProvider>
            </CheckoutProvider>
        );
    });

    it('edit guest customer email', async () => {
        checkoutService = checkout.use(CheckoutPreset.CheckoutWithBillingEmail);

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

        checkoutService = checkout.use(CheckoutPreset.CheckoutWithDigitalCart);

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

        checkoutService = checkout.use(CheckoutPreset.CheckoutWithDigitalCart);

        render(<CheckoutTest {...defaultProps} />);

        await checkout.waitForCustomerStep();

        await userEvent.type(await screen.findByLabelText('Email'), email);
        await userEvent.click(await screen.findByText('Sign in now'));

        expect(screen.getByLabelText('Email')).toHaveDisplayValue(email);
        await userEvent.type(await screen.findByLabelText('Password'), password);

        checkout.setRequestHandler(
            rest.post(
                '/internalapi/v1/checkout/customer',
                (_, res, ctx) => res(
                    ctx.json({ data: { persistentCartRetrievalInformation: false } })
                )
            )
        );

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

    it('calls onContinueAsGuestError when empty cart error is thrown', async () => {
        const customerEmail = faker.internet.email();

        render(
            <CheckoutTest {...defaultProps} />)
        ;

        await checkout.waitForCustomerStep();

        checkout.setRequestHandler(
            rest.post(
                '/api/storefront/checkouts/*/billing-address',
                (_, res, ctx) => res(
                    ctx.status(400),
                    ctx.json({
                        type: 'empty_cart',
                        title: 'Empty cart',
                        detail: 'Cart is empty'
                    })
                )
            )
        );
        
        await act(async () => {
            await userEvent.clear(await screen.findByLabelText('Email'));
            await userEvent.type(await screen.findByLabelText('Email'), customerEmail);
            await userEvent.click(await screen.findByText('Continue'));
        });

        // Wait for the ReactModal to appear using its data-test attribute
        expect(await screen.findByTestId('modal-body')).toBeInTheDocument();
        
        // Check for the actual error message from the translation
        expect(await screen.findByText("Your cart contains items that aren't available for purchase or have exceeded the purchase limit. To place your order, please create a new cart with the quantities to the allowed limit or with different items.")).toBeInTheDocument();
    });

    describe('sign in link shouldRedirectToStorefrontForAuth', () => {
        it('redirects to the login page if experiment is on and shouldRedirectToStorefrontForAuth is true', async () => {
            Object.defineProperty(window, 'location', {
                writable: true,
                value: {
                    // eslint-disable-next-line @typescript-eslint/no-misused-spread
                    ...window.location,
                    assign: jest.fn(),
                },
            });

            const config = {
                ...checkoutSettings,
                storeConfig: {
                    ...checkoutSettings.storeConfig,
                    checkoutSettings: {
                        ...checkoutSettings.storeConfig.checkoutSettings,
                        shouldRedirectToStorefrontForAuth: true,
                    },
                },
            };

            checkoutService = checkout.use(CheckoutPreset.CheckoutWithDigitalCart, { config });
            render(<CheckoutTest {...defaultProps} />);
            await checkout.waitForCustomerStep();

            await userEvent.click(await screen.findByText('Sign in now'));
            expect(window.location.assign).toHaveBeenCalled();
        });
    });

    it('redirects to storefront for login if shouldRedirectToStorefrontForAuth is true and login is enforced', async () => {
        Object.defineProperty(window, 'location', {
            writable: true,
            value: {
                // eslint-disable-next-line @typescript-eslint/no-misused-spread
                ...window.location,
                assign: jest.fn(),
            },
        });

        const config = {
            ...checkoutSettings,
            storeConfig: {
                ...checkoutSettings.storeConfig,
                checkoutSettings: {
                    ...checkoutSettings.storeConfig.checkoutSettings,
                    shouldRedirectToStorefrontForAuth: true,
                },
            },
        };

        checkoutService = checkout.use(CheckoutPreset.CheckoutWithDigitalCart, { config });

        const customerEmail = faker.internet.email();

        render(<CheckoutTest {...defaultProps} />);

        await checkout.waitForCustomerStep();

        checkout.setRequestHandler(
            rest.post(
                '/api/storefront/checkouts/*/billing-address',
                (_, res, ctx) => res(
                    ctx.status(403),
                    ctx.json({
                        type: 'about:blank',
                        title: 'Sign in to Your Account',
                        detail: 'This email is already associated to an account. Please login to continue.'
                    })
                )
            )
        );

        await act(async () => {
            await userEvent.type(await screen.findByLabelText('Email'), customerEmail);
            await userEvent.click(await screen.findByText('Continue'));
        });

        await userEvent.click(await screen.findByText('Sign In'));

        expect(window.location.assign).toHaveBeenCalled();
    });
});

describe('Customer Component with Stripe', () => {
    let CustomerTest: FunctionComponent<CustomerProps>;
    let billingAddress: BillingAddress;
    let checkout: CheckoutObject;
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
        step: {} as CheckoutStepStatus,
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
            },
        };

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
                        <ThemeProvider>
                            <Customer {...props} />
                        </ThemeProvider>
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
                type: CheckoutStepType.Customer,
            };

            jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue(
                configStripeUpe,
            );

            render(
                <CustomerTest {...defaultProps} step={steps} viewType={CustomerViewType.Guest} />,
            );

            await new Promise((resolve) => process.nextTick(resolve));

            // eslint-disable-next-line testing-library/no-node-access
            expect(document.querySelector('#stripeupeLink')).toBeInTheDocument();
            expect(await screen.findByTestId('stripe-customer-continue-as-guest-button')).toBeInTheDocument();
        });

        it("doesn't render Stripe guest form if it enabled but cart amount is smaller then Stripe requires", async () => {
            jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue(
                configStripeUpe,
            );
            jest.spyOn(checkoutService.getState().data, 'getCart').mockReturnValue({
                ...cart,
                cartAmount: 0.4,
            });

            const steps = {
                isActive: true,
                isComplete: true,
                isEditable: true,
                isRequired: true,
                isBusy: false,
                type: CheckoutStepType.Customer,
            };

            render(
                <CustomerTest {...defaultProps} step={steps} viewType={CustomerViewType.Guest} />,
            );

            await new Promise((resolve) => process.nextTick(resolve));

            // eslint-disable-next-line testing-library/no-node-access
            expect(document.querySelector('#stripeupeLink')).not.toBeInTheDocument();
            expect(await screen.findByTestId('checkout-customer-guest')).toBeInTheDocument();
            expect(await screen.findByTestId('customer-continue-as-guest-button')).toBeInTheDocument();
        });
    });
});
