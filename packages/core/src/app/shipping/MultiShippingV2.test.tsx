import {
    CheckoutService,
    createCheckoutService,
    createEmbeddedCheckoutMessenger,
    EmbeddedCheckoutMessenger,
} from '@bigcommerce/checkout-sdk';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';
import { act } from 'react-dom/test-utils';

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
    checkoutWithMultiShippingCart,
    consignment,
    shippingAddress2,
    shippingAddress3,
    shippingQuoteFailedMessage,
} from '@bigcommerce/checkout/test-framework';

import Checkout, { CheckoutProps } from '../checkout/Checkout';
import { createErrorLogger } from '../common/error';
import {
    createEmbeddedCheckoutStylesheet,
    createEmbeddedCheckoutSupport,
} from '../embeddedCheckout';

describe('Multi-shipping V2', () => {
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
                            <Checkout {...props} />
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

        jest.spyOn(checkoutService, 'selectConsignmentShippingOption');

        checkout.use(CheckoutPreset.CheckoutWithMultiShipping);

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

        // eslint-disable-next-line testing-library/no-unnecessary-act
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

        // eslint-disable-next-line testing-library/no-unnecessary-act
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

        jest.spyOn(checkoutService, 'selectConsignmentShippingOption');

        checkout.use(CheckoutPreset.CheckoutWithMultiShipping);

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

        // eslint-disable-next-line testing-library/no-unnecessary-act
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

        // eslint-disable-next-line testing-library/no-unnecessary-act
        await act(async () => {
            await userEvent.click(screen.getByText(/333 testing Rd/i));
            await userEvent.click(screen.getByText(/111 testing Rd/i));
        });

        const selectedShippingOptions = await screen.findAllByRole('radio', { checked: true });

        // eslint-disable-next-line jest-dom/prefer-to-have-attribute
        expect(selectedShippingOptions[0].getAttribute('value')).toBe('option-id-pick-up');
        expect(screen.queryByText(shippingQuoteFailedMessage)).not.toBeInTheDocument();
    });
});
