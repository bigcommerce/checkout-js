import {
    type CheckoutService,
    createCheckoutService,
    createEmbeddedCheckoutMessenger,
    type EmbeddedCheckoutMessenger,
} from '@bigcommerce/checkout-sdk';
import { faker } from '@faker-js/faker';
import userEvent from '@testing-library/user-event';
import { noop } from 'lodash';
import { rest } from 'msw';
import React, { type FunctionComponent } from 'react';

import { ExtensionProvider } from '@bigcommerce/checkout/checkout-extension';
import {
    type AnalyticsContextProps,
    type AnalyticsEvents,
    AnalyticsProviderMock,
 ThemeProvider } from '@bigcommerce/checkout/contexts';
import { getLanguageService, LocaleProvider } from '@bigcommerce/checkout/locale';
import {
    CHECKOUT_ROOT_NODE_ID,
    CheckoutProvider,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    CheckoutPageNodeObject,
    CheckoutPreset,
    checkoutSettings,
    checkoutWithBillingEmail,
    checkoutWithCustomerHavingInvalidAddress,
    checkoutWithMultiShippingCart,
    checkoutWithShipping,
    checkoutWithShippingAndBilling,
    consignment,
    payments,
    shippingAddress,
    shippingQuoteFailedMessage,
} from '@bigcommerce/checkout/test-framework';
import { renderWithoutWrapper as render, screen, within } from '@bigcommerce/checkout/test-utils';

import Checkout, { type CheckoutProps } from '../checkout/Checkout';
import { createErrorLogger } from '../common/error';
import {
    createEmbeddedCheckoutStylesheet,
    createEmbeddedCheckoutSupport,
} from '../embeddedCheckout';

describe('Shipping step', () => {
    let checkout: CheckoutPageNodeObject;
    let CheckoutTest: FunctionComponent<CheckoutProps>;
    let checkoutService: CheckoutService;
    let defaultProps: CheckoutProps & AnalyticsContextProps;
    let embeddedMessengerMock: EmbeddedCheckoutMessenger;
    let analyticsTracker: Partial<AnalyticsEvents>;

    beforeAll(() => {
        checkout = new CheckoutPageNodeObject();
        checkout.goto();
    });

    afterEach(() => {
        jest.unmock('lodash');
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
            trackStepViewed: jest.fn(),
            trackStepCompleted: jest.fn(),
            exitCheckout: jest.fn(),
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
        jest.spyOn(checkoutService, 'updateShippingAddress');
        jest.spyOn(checkoutService, 'updateBillingAddress');

        jest.mock('lodash', () => ({
            ...jest.requireActual('lodash'),
            debounce: (fn) => {
                fn.cancel = jest.fn();

                return fn;
            },
        }));

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

    describe('Shipping step happy paths', () => {
        it('completes the shipping step as a guest and goes to the payment step by default', async () => {
            checkoutService = checkout.use(CheckoutPreset.CheckoutWithBillingEmail);

            jest.spyOn(checkoutService, 'updateShippingAddress');
            jest.spyOn(checkoutService, 'updateBillingAddress');

            const { container } = render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForShippingStep();

            checkout.updateCheckout(
                'post',
                '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/consignments',
                {
                    ...checkoutWithBillingEmail,
                    consignments: [
                        {
                            ...consignment,
                            selectedShippingOption: undefined,
                        },
                    ],
                },
            );
            checkout.updateCheckout(
                'put',
                '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/consignments/consignment-1',
                {
                    ...checkoutWithShipping,
                },
            );

            await checkout.fillAddressForm();

            expect(checkoutService.updateShippingAddress).toHaveBeenCalled();
            expect(
                screen.getByRole('radio', { name: 'Pickup In Store $3.00' }),
            ).toBeInTheDocument();
            expect(screen.getByRole('radio', { name: 'Flat Rate $10.00' })).toBeInTheDocument();
            // eslint-disable-next-line testing-library/no-container,testing-library/no-node-access
            expect(container.getElementsByClassName('shippingOptions-skeleton').length).toBe(0);
            // eslint-disable-next-line testing-library/no-container,testing-library/no-node-access
            expect(container.getElementsByClassName('form-checklist-item--selected').length).toBe(
                1,
            );
            // eslint-disable-next-line jest-dom/prefer-to-have-attribute
            expect(
                screen.getByLabelText('My billing address is the same as my shipping address.').hasAttribute('checked'),
            ).toBeTruthy();

            checkout.updateCheckout(
                'put',
                '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/billing-address/billing-address-id*',
                {
                    ...checkoutWithShippingAndBilling,
                },
            );

            await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

            await checkout.waitForPaymentStep();

            expect(checkoutService.updateBillingAddress).toHaveBeenCalled();
            expect(screen.getByRole('radio', { name: payments[0].config.displayName })).toBeInTheDocument();
        });

        it('completes the shipping step as a guest and goes to the billing step', async () => {
            checkoutService = checkout.use(CheckoutPreset.CheckoutWithBillingEmail);

            jest.spyOn(checkoutService, 'updateBillingAddress');

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForShippingStep();

            expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();

            checkout.updateCheckout(
                'post',
                '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/consignments',
                {
                    ...checkoutWithBillingEmail,
                    consignments: [
                        {
                            ...consignment,
                            selectedShippingOption: undefined,
                        },
                    ],
                },
            );
            checkout.updateCheckout(
                'put',
                '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/consignments/consignment-1',
                {
                    ...checkoutWithShipping,
                },
            );

            await checkout.fillAddressForm();
            await userEvent.click(screen.getByLabelText('My billing address is the same as my shipping address.'));
            await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
            await checkout.waitForBillingStep();

            expect(checkoutService.updateBillingAddress).not.toHaveBeenCalled();
            // one `edit` button is for the cart, the other is for the shipping address.
            expect(screen.getAllByRole('button', { name: 'Edit' })).toHaveLength(2);
            expect(screen.getByLabelText('First Name')).toBeInTheDocument();
        });

        it('completes the shipping step as a customer with no saved address and goes to the payment step by default', async () => {
            checkoutService = checkout.use(CheckoutPreset.CheckoutWithLoggedInCustomer);

            jest.spyOn(checkoutService, 'updateShippingAddress');
            jest.spyOn(checkoutService, 'updateBillingAddress');

            const { container } = render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForShippingStep();

            checkout.updateCheckout(
                'post',
                '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/consignments',
                {
                    ...checkoutWithBillingEmail,
                    consignments: [
                        {
                            ...consignment,
                            selectedShippingOption: undefined,
                        },
                    ],
                },
            );
            checkout.updateCheckout(
                'put',
                '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/consignments/consignment-1',
                {
                    ...checkoutWithShipping,
                },
            );

            await checkout.fillAddressForm();

            expect(checkoutService.updateShippingAddress).toHaveBeenCalled();
            expect(
                screen.getByRole('radio', { name: 'Pickup In Store $3.00' }),
            ).toBeInTheDocument();
            expect(screen.getByRole('radio', { name: 'Flat Rate $10.00' })).toBeInTheDocument();
            // eslint-disable-next-line testing-library/no-container,testing-library/no-node-access
            expect(container.getElementsByClassName('shippingOptions-skeleton').length).toBe(0);
            // eslint-disable-next-line testing-library/no-container,testing-library/no-node-access
            expect(container.getElementsByClassName('form-checklist-item--selected').length).toBe(
                1,
            );
            // eslint-disable-next-line jest-dom/prefer-to-have-attribute
            expect(
                screen.getByLabelText('My billing address is the same as my shipping address.').hasAttribute('checked'),
            ).toBeTruthy();
            // eslint-disable-next-line jest-dom/prefer-to-have-attribute
            expect(
                screen.getByLabelText('Save this address in my address book.').hasAttribute('checked'),
            ).toBeTruthy();

            checkout.updateCheckout(
                'put',
                '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/billing-address/billing-address-id*',
                {
                    ...checkoutWithShippingAndBilling,
                },
            );

            await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

            await checkout.waitForPaymentStep();

            expect(checkoutService.updateBillingAddress).toHaveBeenCalled();
            expect(screen.getByRole('radio', { name: payments[0].config.displayName })).toBeInTheDocument();
        });

        it('selects the valid customer address and completes the shipping step', async () => {
            checkoutService = checkout.use(CheckoutPreset.CheckoutWithMultiShippingCart);

            jest.spyOn(checkoutService, 'updateShippingAddress');
            jest.spyOn(checkoutService, 'updateBillingAddress');

            const { container } = render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForShippingStep();

            checkout.updateCheckout(
                'post',
                '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/consignments',
                {
                    ...checkoutWithBillingEmail,
                    consignments: [
                        {
                            ...consignment,
                            selectedShippingOption: undefined,
                        },
                    ],
                },
            );
            checkout.updateCheckout(
                'put',
                '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/consignments/consignment-1',
                {
                    ...checkoutWithShipping,
                },
            );

            checkout.updateCheckout(
                'put',
                '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/billing-address/billing-address-id*',
                {
                    ...checkoutWithShippingAndBilling,
                },
            );

            expect(screen.getByTestId('address-select-button')).toBeInTheDocument();
            await userEvent.click(screen.getByTestId('address-select-button'));
            await userEvent.click(screen.getByText(/111 Testing Rd/i));

            expect(checkoutService.updateShippingAddress).toHaveBeenCalled();
            expect(
                screen.getByRole('radio', { name: 'Pickup In Store $3.00' }),
            ).toBeInTheDocument();
            expect(screen.getByRole('radio', { name: 'Flat Rate $10.00' })).toBeInTheDocument();
            // eslint-disable-next-line testing-library/no-container,testing-library/no-node-access
            expect(container.getElementsByClassName('shippingOptions-skeleton').length).toBe(0);
            // eslint-disable-next-line testing-library/no-container,testing-library/no-node-access
            expect(container.getElementsByClassName('form-checklist-item--selected').length).toBe(
                1,
            );
            // eslint-disable-next-line jest-dom/prefer-to-have-attribute
            expect(
                screen.getByLabelText('My billing address is the same as my shipping address.').hasAttribute('checked'),
            ).toBeTruthy();

            await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

            await checkout.waitForPaymentStep();

            expect(checkoutService.updateBillingAddress).toHaveBeenCalled();
            expect(screen.getByRole('radio', { name: payments[0].config.displayName })).toBeInTheDocument();
        });

        it('enters new address for the customer with saved address and completes the shipping step', async () => {

            const config = {
                ...checkoutSettings,
                storeConfig: {
                    ...checkoutSettings.storeConfig,
                    checkoutSettings: {
                        ...checkoutSettings.storeConfig.checkoutSettings,
                        checkoutBillingSameAsShippingEnabled: false,
                    },
                },
            };

            checkoutService = checkout.use(CheckoutPreset.CheckoutWithMultiShippingCart, { config });

            jest.spyOn(checkoutService, 'updateShippingAddress');
            jest.spyOn(checkoutService, 'updateBillingAddress');

            const { container } = render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForShippingStep();

            checkout.updateCheckout(
                'post',
                '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/consignments',
                {
                    ...checkoutWithBillingEmail,
                    consignments: [
                        {
                            ...consignment,
                            selectedShippingOption: undefined,
                        },
                    ],
                },
            );
            checkout.updateCheckout(
                'put',
                '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/consignments/consignment-1',
                {
                    ...checkoutWithShipping,
                },
            );

            checkout.updateCheckout(
                'put',
                '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/billing-address/billing-address-id*',
                {
                    ...checkoutWithShippingAndBilling,
                },
            );

            expect(screen.getByTestId('address-select-button')).toBeInTheDocument();
            await userEvent.click(screen.getByTestId('address-select-button'));
            await userEvent.click(screen.getByTestId('add-new-address'));
            await checkout.fillAddressForm();

            expect(checkoutService.updateShippingAddress).toHaveBeenCalled();
            expect(
                screen.getByRole('radio', { name: 'Pickup In Store $3.00' }),
            ).toBeInTheDocument();
            expect(screen.getByRole('radio', { name: 'Flat Rate $10.00' })).toBeInTheDocument();
            // eslint-disable-next-line testing-library/no-container,testing-library/no-node-access
            expect(container.getElementsByClassName('shippingOptions-skeleton').length).toBe(0);
            // eslint-disable-next-line testing-library/no-container,testing-library/no-node-access
            expect(container.getElementsByClassName('form-checklist-item--selected').length).toBe(
                1,
            );
            // eslint-disable-next-line jest-dom/prefer-to-have-attribute
            expect(
                screen.queryByLabelText('My billing address is the same as my shipping address.').hasAttribute('checked'),
            ).toBeFalsy();

            await userEvent.click(screen.getByLabelText('My billing address is the same as my shipping address.'));
            await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

            await checkout.waitForPaymentStep();

            expect(checkoutService.updateBillingAddress).toHaveBeenCalled();
            expect(screen.getByRole('radio', { name: payments[0].config.displayName })).toBeInTheDocument();
        });

        it('selects the invalid customer address, fills the address form and finally completes the shipping step', async () => {
            checkoutService = checkout.use(CheckoutPreset.CheckoutWithCustomerHavingInvalidAddress);

            jest.spyOn(checkoutService, 'updateShippingAddress');
            jest.spyOn(checkoutService, 'updateBillingAddress');

            const { container } = render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForShippingStep();

            checkout.updateCheckout(
                'post',
                '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/consignments',
                {
                    ...checkoutWithCustomerHavingInvalidAddress,
                    consignments: [],
                },
            );
            expect(screen.getByTestId('address-select-button')).toBeInTheDocument();
            await userEvent.click(screen.getByTestId('address-select-button'));
            await userEvent.click(screen.getByText(/Fourth/i));

            await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

            expect(await screen.findByLabelText('First Name')).toHaveDisplayValue('Fourth');
            expect(await screen.findByLabelText('Last Name')).toHaveDisplayValue('Address');
            expect(screen.getByText('Address is required')).toBeInTheDocument();
            expect(screen.getByLabelText('Save this address in my address book.')).toBeInTheDocument();

            checkout.updateCheckout(
                'post',
                '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/consignments',
                {
                    ...checkoutWithShipping,
                    consignments: [
                        {
                            ...consignment,
                            selectedShippingOption: undefined,
                        },
                    ],
                },
            );
            checkout.updateCheckout(
                'put',
                '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/consignments/consignment-1',
                {
                    ...checkoutWithShipping,
                },
            );

            await userEvent.type(
                screen.getByRole('textbox', { name: /address/i }),
                shippingAddress.address1,
            );

            expect(checkoutService.updateShippingAddress).toHaveBeenCalled();

            expect(
                screen.getByRole('radio', { name: 'Pickup In Store $3.00' }),
            ).toBeInTheDocument();
            expect(screen.getByRole('radio', { name: 'Flat Rate $10.00' })).toBeInTheDocument();
            // eslint-disable-next-line testing-library/no-container,testing-library/no-node-access
            expect(container.getElementsByClassName('shippingOptions-skeleton').length).toBe(0);
            // eslint-disable-next-line testing-library/no-container,testing-library/no-node-access
            expect(container.getElementsByClassName('form-checklist-item--selected').length).toBe(
                1,
            );
            // eslint-disable-next-line jest-dom/prefer-to-have-attribute
            expect(
                screen.getByLabelText('My billing address is the same as my shipping address.').hasAttribute('checked'),
            ).toBeTruthy();

            checkout.updateCheckout(
                'put',
                '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/billing-address/billing-address-id*',
                {
                    ...checkoutWithShippingAndBilling,
                },
            );

            await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

            await checkout.waitForPaymentStep();

            expect(checkoutService.updateBillingAddress).toHaveBeenCalled();
            expect(screen.getByRole('radio', { name: payments[0].config.displayName })).toBeInTheDocument();
        });

        it('goes back to the shipping step as a guest and updates the shipping address form correctly', async () => {
            checkoutService = checkout.use(CheckoutPreset.CheckoutWithShippingAndBilling);

            jest.spyOn(checkoutService, 'updateShippingAddress');
            jest.spyOn(checkoutService, 'updateBillingAddress');

            checkout.updateCheckout(
                'put',
                '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/consignments/consignment-1',
                {
                    ...checkoutWithShippingAndBilling,
                },
            );

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForPaymentStep();

            await userEvent.click(screen.getAllByRole('button', { name: 'Edit' })[1]);

            const randomAddress1 = JSON.parse(JSON.stringify({
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName(),
                address1: faker.address.streetAddress(),
                city: faker.address.city(),
                countryCode: 'CC',
                stateOrProvince: 'dummy state',
                postalCode: faker.address.zipCode(),
            }));

            await checkout.fillAddressForm(randomAddress1);
            await userEvent.selectOptions(
                screen.getByTestId('field_60Input-select'),
                '2',
            );

            expect((checkoutService.updateShippingAddress as any).mock.calls.slice(-1)[0][0]).toEqual(
                expect.objectContaining({
                    ...randomAddress1,
                    customFields: [{ fieldId: 'field_60', fieldValue: '2' }],
                }),
            );

            const randomAddress2 = JSON.parse(JSON.stringify({
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName(),
                address1: faker.address.streetAddress(),
                city: faker.address.city(),
                countryCode: 'AU',
                stateOrProvinceCode: faker.helpers.arrayElement(['NSW', 'VIC', 'QLD', 'TAS']),
                postalCode: faker.address.zipCode(),
            }));

            await checkout.fillAddressForm(randomAddress2);
            await userEvent.selectOptions(
                screen.getByTestId('field_60Input-select'),
                '1',
            );

            expect((checkoutService.updateShippingAddress as any).mock.calls.slice(-1)[0][0]).toEqual(
                expect.objectContaining({
                        ...randomAddress2,
                        customFields: [{ fieldId: 'field_60', fieldValue: '1' }],
                }),
            );
        });
    });

    it.only('renders and validates shipping form built-in and customfields', async () => {
        checkoutService = checkout.use(CheckoutPreset.CheckoutWithBillingEmailAndCustomFormFields);

        jest.spyOn(checkoutService, 'updateShippingAddress');
        jest.spyOn(checkoutService, 'updateBillingAddress');

        render(<CheckoutTest {...defaultProps} />);

        await checkout.waitForShippingStep();

        checkout.updateCheckout(
            'post',
            '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/consignments',
            {
                ...checkoutWithBillingEmail,
                consignments: [
                    {
                        ...consignment,
                        selectedShippingOption: undefined,
                    },
                ],
            },
        );
        checkout.updateCheckout(
            'put',
            '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/consignments/consignment-1',
            {
                ...checkoutWithShipping,
            },
        );
        checkout.updateCheckout(
            'put',
            '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/billing-address/billing-address-id*',
            {
                ...checkoutWithShippingAndBilling,
            },
        );

        await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

        expect(screen.getByText('First Name is required')).toBeInTheDocument();
        expect(screen.getByText('Last Name is required')).toBeInTheDocument();
        expect(screen.getByText('Address is required')).toBeInTheDocument();
        expect(screen.getByText('City is required')).toBeInTheDocument();
        expect(screen.getByText('Postal Code is required')).toBeInTheDocument();
        expect(screen.getByText('Custom Text is required')).toBeInTheDocument();
        expect(screen.getByText('Custom Date is required')).toBeInTheDocument();
        expect(screen.getByText('Custom Number is required')).toBeInTheDocument();
        expect(screen.getByText('Custom Checkbox is required')).toBeInTheDocument();
        expect(screen.getByText('Custom Radio is required')).toBeInTheDocument();
        expect(screen.getByText('Custom Dropdown is required')).toBeInTheDocument();

        await checkout.fillAddressForm();
        await userEvent.type(screen.getByLabelText('Custom Text'), 'Custom Text');
        await userEvent.click(screen.getByPlaceholderText('DD/MM/YYYY'));
        await userEvent.type(screen.getByPlaceholderText('DD/MM/YYYY'), '01/01/2015');
        await userEvent.keyboard('{enter}');

        expect(screen.getByPlaceholderText('DD/MM/YYYY')).toHaveDisplayValue('01/01/2020');

        await userEvent.type(screen.getByLabelText('Custom Message'), 'Custom message text');
        await userEvent.type(screen.getByLabelText('Custom Number'), '123');

        // TODO: CHECKOUT-9049 bug to be fixed (should be no more than 6 characters)
        expect(screen.getByText('Custom Number should be no more than 6 characters')).toBeInTheDocument();

        await userEvent.clear(screen.getByLabelText('Custom Number'));
        await userEvent.type(screen.getByLabelText('Custom Number'), '2');

        // TODO: CHECKOUT-9049 bug to be fixed (should be no less than 2 characters)
        expect(screen.getByText('Custom Number should be no less than 2 characters')).toBeInTheDocument();

        await userEvent.clear(screen.getByLabelText('Custom Number'));
        await userEvent.type(screen.getByLabelText('Custom Number'), '3');

        const customCheckbox = screen.getByText('Custom Checkbox');

        // eslint-disable-next-line testing-library/no-node-access
        await userEvent.click(within(customCheckbox.parentElement).getByLabelText('1'));
        // eslint-disable-next-line testing-library/no-node-access
        await userEvent.click(within(customCheckbox.parentElement).getByLabelText('2'));

        const customDropdown = screen.getByLabelText('Custom Dropdown');

        await userEvent.selectOptions(customDropdown, '1');

        const customRadio = screen.getByText('Custom Radio');

        // eslint-disable-next-line testing-library/no-node-access
        await userEvent.click(within(customRadio.parentElement).getByText('yes'));

        await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

        expect(checkoutService.updateShippingAddress).toHaveBeenCalled();
    });

    describe('Shipping options', () => {
        it('sees the quote failed message when no shipping option available', async () => {
            jest.mock('lodash', () => ({
                ...jest.requireActual('lodash'),
                debounce: (fn) => {
                    fn.cancel = jest.fn();

                    return fn;
                },
            }));

            checkoutService = checkout.use(CheckoutPreset.CheckoutWithBillingEmail);

            jest.spyOn(checkoutService, 'updateShippingAddress');
            jest.spyOn(checkoutService, 'updateBillingAddress');

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForShippingStep();

            const checkoutMock = {
                ...checkoutWithBillingEmail,
                consignments: [
                    {
                        ...consignment,
                        selectedShippingOption: undefined,
                        availableShippingOptions: undefined,
                    },
                ],
            };

            checkout.updateCheckout(
                'post',
                '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/consignments',
                checkoutMock,
            );
            checkout.updateCheckout(
                'put',
                '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/consignments/consignment-1',
                checkoutMock,
            );

            await checkout.fillAddressForm();

            expect(checkoutService.updateShippingAddress).toHaveBeenCalled();
            expect(
                screen.getByText(shippingQuoteFailedMessage),
            ).toBeInTheDocument();
        });

        it('selects another shipping option', async () => {
            checkoutService = checkout.use(CheckoutPreset.CheckoutWithBillingEmail);

            jest.spyOn(checkoutService, 'updateShippingAddress');
            jest.spyOn(checkoutService, 'selectConsignmentShippingOption');

            const  { container } = render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForShippingStep();

            checkout.updateCheckout(
                'post',
                '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/consignments',
                checkoutWithShipping,
            );
            checkout.updateCheckout(
                'put',
                '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/consignments/consignment-1',
                {
                    ...checkoutWithShipping,
                },
            );

            await checkout.fillAddressForm();

            expect(checkoutService.updateShippingAddress).toHaveBeenCalled();
            // eslint-disable-next-line testing-library/no-container,testing-library/no-node-access
            expect(container.getElementsByClassName('form-checklist-item--selected')[0]).toHaveTextContent('Pickup In Store$3.00');

            await userEvent.click(screen.getByRole('radio', { name: 'Flat Rate $10.00' }));

            expect(checkoutService.selectConsignmentShippingOption).toHaveBeenCalled();
            // eslint-disable-next-line testing-library/no-container,testing-library/no-node-access
            expect(container.getElementsByClassName('form-checklist-item--selected')[0]).toHaveTextContent('Flat Rate$10.00');
        });
    });

    it('renders multi-shipping static consignments', async () => {
        checkoutService = checkout.use(CheckoutPreset.CheckoutWithMultiShippingCart, {
            checkout: {
                ...checkoutWithMultiShippingCart,
                consignments: [
                    {
                        ...consignment,
                        lineItemIds: ['x', 'y'],
                    },
                    {
                        ...consignment,
                        id: 'consignment-2',
                        lineItemIds: ['z'],
                    },
                ],
            },
        });

        /*
        checkout.updateCheckout('get',
            '/checkout/*',
            {
                ...checkoutWithMultiShippingCart,
                consignments: [
                    {
                        ...consignment,
                        lineItemIds: ['x', 'y'],
                    },
                    {
                        ...consignment,
                        id: 'consignment-2',
                        lineItemIds: ['z'],
                    },
                ],
            }
        );
        */

        jest.spyOn(checkoutService, 'updateShippingAddress');
        jest.spyOn(checkoutService, 'updateBillingAddress');

        render(<CheckoutTest {...defaultProps} />);

        await checkout.waitForBillingStep();

        expect(screen.getByText('Destination #1')).toBeInTheDocument();
        expect(screen.getByText('Destination #2')).toBeInTheDocument();
    });
});
