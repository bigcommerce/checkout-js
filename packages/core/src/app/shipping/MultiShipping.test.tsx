import {
    type CheckoutService,
    createCheckoutService,
    createEmbeddedCheckoutMessenger,
    type EmbeddedCheckoutMessenger,
} from '@bigcommerce/checkout-sdk';
import { faker } from '@faker-js/faker';
import userEvent from '@testing-library/user-event';
import { noop } from 'lodash';
import React, { act, type FunctionComponent } from 'react';

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
    checkoutWithGuestMultiShippingCart,
    checkoutWithMultiShippingCart,
    consignment,
    shippingAddress2,
    shippingAddress3,
    shippingQuoteFailedMessage,
} from '@bigcommerce/checkout/test-framework';
import { renderWithoutWrapper as render, screen } from '@bigcommerce/checkout/test-utils';

import { getAddressContent } from '../address/SingleLineStaticAddress';
import Checkout, { type CheckoutProps } from '../checkout/Checkout';
import { createErrorLogger } from '../common/error';
import {
    createEmbeddedCheckoutStylesheet,
    createEmbeddedCheckoutSupport,
} from '../embeddedCheckout';

describe('Multi-shipping', () => {
    let checkout: CheckoutPageNodeObject;
    let CheckoutTest: FunctionComponent<CheckoutProps>;
    let checkoutService: CheckoutService;
    let defaultProps: CheckoutProps & AnalyticsContextProps;
    let embeddedMessengerMock: EmbeddedCheckoutMessenger;
    let analyticsTracker: AnalyticsEvents;

    const language = getLanguageService();

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
                            <ThemeProvider>
                                <Checkout {...props} />
                            </ThemeProvider>
                        </ExtensionProvider>
                    </AnalyticsProviderMock>
                </LocaleProvider>
            </CheckoutProvider>
        );
    });

    it('creates two consignments and works around the API side issue', async () => {
        // ✅clicks the `Add new destination` button and sees error
        // ✅creates the first consignment with the cart itemId `x`
        // ✅sees the first consignment's default shipping method selected
        // ✅creates the second consignment with the cart itemId `y`
        // ✅sees the loss of the first consignment's selected shipping method as an API issue
        // ✅sees the first consignment's previous selected shipping method restored
        // ✅sees the second consignment's default shipping method selected

        checkoutService = checkout.use(CheckoutPreset.CheckoutWithMultiShippingCart);

        jest.spyOn(checkoutService, 'selectConsignmentShippingOption');

        render(<CheckoutTest {...defaultProps} />);

        await checkout.waitForShippingStep();

        await userEvent.click(screen.getByText(/Ship to multiple addresses/i));

        await userEvent.click(
            await screen.findByRole('button', {
                name: 'Add new destination',
            }),
        );
        expect(
            screen.getByText(
                language.translate('shipping.multishipping_incomplete_consignment_error', {
                    consignmentNumber: 1,
                }),
            ),
        ).toBeInTheDocument();

        checkout.updateCheckout(
            'post',
            '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/consignments',
            {
                ...checkoutWithMultiShippingCart,
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
                ...checkoutWithMultiShippingCart,
                consignments: [consignment],
            },
        );

        await act(async () => {
            await userEvent.click(screen.getByText('Choose a shipping address'));
            await userEvent.click(screen.getByText(/111 Testing Rd/i));
            await userEvent.click(screen.getByText('Allocate items'));
            await userEvent.type(screen.getByLabelText('Quantity of Item X'), '1');
            await userEvent.click(screen.getByRole('button', { name: 'Allocate' }));
        });

        const selectedShippingOptions = await screen.findAllByRole('radio', { checked: true });

        // eslint-disable-next-line jest-dom/prefer-to-have-attribute
        expect(selectedShippingOptions[0].getAttribute('value')).toBe('option-id-pick-up');
        expect(checkoutService.selectConsignmentShippingOption).toHaveBeenCalledTimes(1);
        expect(
            screen.queryByText(
                language.translate('shipping.multishipping_incomplete_consignment_error', {
                    consignmentNumber: 1,
                }),
            ),
        ).not.toBeInTheDocument();

        const consignment2 = {
            ...consignment,
            id: 'consignment-2',
            lineItemIds: ['y'],
            shippingAddress: {
                ...shippingAddress2,
                shouldSaveAddress: true,
            },
            address: {
                ...shippingAddress2,
                shouldSaveAddress: true,
            },
        };

        checkout.updateCheckout(
            'post',
            '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/consignments',
            {
                ...checkoutWithMultiShippingCart,
                consignments: [
                    {
                        ...consignment,
                        selectedShippingOption: undefined,
                    },
                    {
                        ...consignment2,
                        selectedShippingOption: undefined,
                    },
                ],
            },
        );

        checkout.updateCheckout(
            'put',
            '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/consignments/consignment-1',
            {
                ...checkoutWithMultiShippingCart,
                consignments: [
                    {
                        ...consignment,
                        selectedShippingOption: consignment.availableShippingOptions?.[0],
                    },
                    {
                        ...consignment2,
                        selectedShippingOption: undefined,
                    },
                ],
            },
        );

        checkout.updateCheckout(
            'put',
            '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/consignments/consignment-2',
            {
                ...checkoutWithMultiShippingCart,
                consignments: [
                    {
                        ...consignment,
                        selectedShippingOption: consignment2.availableShippingOptions?.[0],
                    },
                    {
                        ...consignment2,
                        selectedShippingOption: consignment2.availableShippingOptions?.[0],
                    },
                ],
            },
        );

        await act(async () => {
            await userEvent.click(screen.getByRole('button', { name: 'Add new destination' }));
            await userEvent.click(screen.getByText('Choose a shipping address'));
            await userEvent.click(screen.getByText(/222 Testing Rd/i));
            await userEvent.click(screen.getByText('Allocate items'));
            await userEvent.type(screen.getByLabelText('Quantity of Item Y'), '2');
            await userEvent.click(screen.getByRole('button', { name: 'Allocate' }));
        });

        const allSelectedShippingOptions = await screen.findAllByRole('radio', { checked: true });

        expect(checkoutService.selectConsignmentShippingOption).toHaveBeenCalledTimes(2);
        expect(allSelectedShippingOptions).toHaveLength(2);
        // eslint-disable-next-line jest-dom/prefer-to-have-attribute
        expect(allSelectedShippingOptions[0].getAttribute('value')).toBe('option-id-pick-up');
        // eslint-disable-next-line jest-dom/prefer-to-have-attribute
        expect(allSelectedShippingOptions[1].getAttribute('value')).toBe('option-id-pick-up');
    });

    it('updates the shipping option of a consignment', async () => {
        // ✅creates the first consignment with the cart itemId `x`
        // ✅no available shipping option for the selected shipping address
        // ✅updates the first consignment's shipping address
        // ✅sees the first consignment's default shipping method selected

        checkoutService = checkout.use(CheckoutPreset.CheckoutWithMultiShippingCart);

        jest.spyOn(checkoutService, 'selectConsignmentShippingOption');

        render(<CheckoutTest {...defaultProps} />);

        await checkout.waitForShippingStep();

        await userEvent.click(screen.getByText(/Ship to multiple addresses/i));

        checkout.updateCheckout(
            'post',
            '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/consignments',
            {
                ...checkoutWithMultiShippingCart,
                consignments: [
                    {
                        ...consignment,
                        selectedShippingOption: undefined,
                        availableShippingOptions: undefined,
                        shippingAddress: {
                            ...shippingAddress3,
                            shouldSaveAddress: true,
                        },
                    },
                ],
            },
        );

        await act(async () => {
            await userEvent.click(screen.getByText('Choose a shipping address'));
            await userEvent.click(
                await screen.findByRole('button', { name: 'Add new destination' }),
            );
            await userEvent.click(screen.getByText(/333 Testing Rd/i));
            await userEvent.click(screen.getByText('Allocate items'));
            await userEvent.type(screen.getByLabelText('Quantity of Item X'), '1');
            await userEvent.click(screen.getByRole('button', { name: 'Allocate' }));
        });

        expect(screen.getByText(shippingQuoteFailedMessage)).toBeInTheDocument();
        expect(
            screen.queryByText(
                language.translate('shipping.multishipping_incomplete_consignment_error', {
                    consignmentNumber: 1,
                }),
            ),
        ).not.toBeInTheDocument();
        expect(checkoutService.selectConsignmentShippingOption).not.toHaveBeenCalled();

        checkout.updateCheckout(
            'put',
            '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/consignments/consignment-1',
            {
                ...checkoutWithMultiShippingCart,
                consignments: [consignment],
            },
        );

        await act(async () => {
            await userEvent.click(screen.getByText(/333 testing Rd/i));
            await userEvent.click(screen.getByText(/111 testing Rd/i));
        });

        const selectedShippingOptions = await screen.findAllByRole('radio', { checked: true });

        // eslint-disable-next-line jest-dom/prefer-to-have-attribute
        expect(selectedShippingOptions[0].getAttribute('value')).toBe('option-id-pick-up');
        expect(screen.queryByText(shippingQuoteFailedMessage)).not.toBeInTheDocument();
    });

    it('completes multi-shipping as a guest', async () => {
        checkoutService = checkout.use(CheckoutPreset.CheckoutWithGuestMultiShippingCart);

        jest.spyOn(checkoutService, 'selectConsignmentShippingOption');

        render(<CheckoutTest {...defaultProps} />);

        await checkout.waitForShippingStep();

        await userEvent.click(screen.getByText(/Ship to multiple addresses/i));

        expect(await screen.findByText(/items left to allocate/)).toBeInTheDocument();
        expect(await screen.findByText(/No shipping address entered/i)).toBeInTheDocument();

        const address = JSON.parse(JSON.stringify({
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            address1: faker.address.streetAddress(),
            city: faker.address.city(),
            countryCode: 'AU',
            stateOrProvinceCode: faker.helpers.arrayElement(['NSW', 'VIC', 'QLD', 'TAS']),
            postalCode: faker.address.zipCode(),
        }));

        const updatedAddress = {
            ...address,
            firstName: `${address.firstName} Updated`,
        }

        checkout.updateCheckout(
            'post',
            '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/consignments',
            {
                ...checkoutWithGuestMultiShippingCart,
                consignments: [
                    {
                        ...consignment,
                        shippingAddress: address,
                        lineItemIds: ['x', 'y', 'z'],
                        selectedShippingOption: undefined,
                    },
                ],
            },
        );

        checkout.updateCheckout(
            'put',
            '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/consignments/consignment-1',
            {
                ...checkoutWithGuestMultiShippingCart,
                consignments: [{
                    ...consignment,
                    shippingAddress: address,
                    lineItemIds: ['x', 'y', 'z'],
                }],
            },
        );

        await act(async () => {
            await userEvent.click(screen.getByText('Enter shipping address'));
            await userEvent.type(await screen.findByLabelText('First Name'), address.firstName);
            await userEvent.type(await screen.findByLabelText('Last Name'), address.lastName);
            await userEvent.type(
                screen.getByRole('textbox', { name: /address/i }),
                address.address1,
            );
            await userEvent.type(await screen.findByLabelText('City'), address.city);
            await userEvent.selectOptions(
                screen.getByTestId('countryCodeInput-select'),
                address.countryCode,
            );

            await userEvent.selectOptions(
                screen.getByTestId('provinceCodeInput-select'),
                address.stateOrProvinceCode,
            );

            await userEvent.type(screen.getByLabelText('Postal Code'), address.postalCode);

            await userEvent.click(screen.getByText('Save Address'));

            expect(screen.getByText(getAddressContent(address))).toBeInTheDocument();

            await userEvent.click(screen.getByText('Allocate items'));
            await userEvent.click(screen.getByText(/Select all items left/i));
            await userEvent.click(screen.getByRole('button', { name: 'Allocate' }));
        });

        const selectedShippingOptions = await screen.findAllByRole('radio', { checked: true });

        // eslint-disable-next-line jest-dom/prefer-to-have-attribute
        expect(selectedShippingOptions[0].getAttribute('value')).toBe('option-id-pick-up');
        expect(checkoutService.selectConsignmentShippingOption).toHaveBeenCalledTimes(1);

        expect(screen.getByText("All items are allocated.")).toBeInTheDocument();

        expect(screen.getByText('Destination #1')).toBeInTheDocument();
        expect(screen.getByText(getAddressContent(address))).toBeInTheDocument();
        expect(screen.getByText("5 items allocated")).toBeInTheDocument();

        checkout.updateCheckout(
            'put',
            '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/consignments/consignment-1',
            {
                ...checkoutWithGuestMultiShippingCart,
                consignments: [{
                    ...consignment,
                    shippingAddress: updatedAddress,
                    lineItemIds: ['x', 'y', 'z'],
                }],
            },
        );

        await userEvent.click(screen.getByTestId("edit-shipping-address"));

        expect(screen.getByLabelText('First Name')).toHaveDisplayValue(address.firstName);
        expect(screen.getByLabelText('Last Name')).toHaveDisplayValue(address.lastName);

        await userEvent.type(screen.getByLabelText('First Name'), ' Updated');
        await userEvent.click(screen.getByText('Save Address'));

        expect(screen.getByText(getAddressContent(updatedAddress))).toBeInTheDocument();
    });
});
