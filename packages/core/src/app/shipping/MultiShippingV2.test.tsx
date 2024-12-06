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
    cartReadyForMultiShipping,
    CheckoutPageNodeObject,
    consignment,
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

    it('creates a consignment then selects the recommended shipping option automatically', async () => {
        jest.spyOn(checkoutService, 'selectConsignmentShippingOption');

        const consignment2withSelectedShipping = {
            ...consignment,
            id: 'consignment-2',
            lineItemIds: ['y'],
            selectedShippingOption: consignment.availableShippingOptions?.[0],
        };

        checkout.use('cartReadyForMultiShipping');

        render(<CheckoutTest {...defaultProps} />);

        await checkout.waitForShippingStep();

        checkout.updateCheckout(
            'post',
            '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/consignments',
            {
                ...cartReadyForMultiShipping,
                consignments: [
                    {
                        ...consignment,
                        selectedShippingOption: undefined,
                    },
                    {
                        ...consignment,
                        id: 'consignment-2',
                        lineItemIds: ['y'],
                        selectedShippingOption: undefined,
                    },
                ],
            },
        );
        checkout.updateCheckout(
            'put',
            '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/consignments/consignment-1',
            {
                ...cartReadyForMultiShipping,
                consignments: [
                    {
                        ...consignment,
                        selectedShippingOption: consignment.availableShippingOptions?.[0],
                    },
                    consignment2withSelectedShipping,
                ],
            },
        );
        checkout.updateCheckout(
            'put',
            '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/consignments/consignment-2',
            {
                ...cartReadyForMultiShipping,
                consignments: [
                    {
                        ...consignment,
                        selectedShippingOption: consignment.availableShippingOptions?.[0],
                    },
                    consignment2withSelectedShipping,
                ],
            },
        );

        // eslint-disable-next-line testing-library/no-unnecessary-act
        await act(async () => {
            await userEvent.click(screen.getByText(/Ship to multiple addresses/i));
            await userEvent.click(screen.getByText(/Enter a new address/i));
            await userEvent.click(screen.getByText(/789 Test Ave/i));
            await userEvent.click(screen.getByText(/Allocate items/i));
            await userEvent.type(screen.getByLabelText('Quantity of Item 2'), '1');
            await userEvent.click(screen.getByRole('button', { name: 'Allocate' }));
        });

        const selectedShippingOptions = (
            await screen.findAllByRole('radio', { checked: true})
        );

        expect(checkoutService.selectConsignmentShippingOption).toHaveBeenCalledTimes(2);
        // eslint-disable-next-line jest-dom/prefer-to-have-attribute
        expect(selectedShippingOptions[0].getAttribute('value')).toBe('option-id-pick-up');
        // eslint-disable-next-line jest-dom/prefer-to-have-attribute
        expect(selectedShippingOptions[1].getAttribute('value')).toBe('option-id-pick-up');
    });

    it('creates a consignment then updates its address and shipping option', async () => {
        jest.spyOn(checkoutService, 'selectConsignmentShippingOption');

        checkout.use('cartReadyForMultiShipping');

        render(<CheckoutTest {...defaultProps} />);

        await checkout.waitForShippingStep();

        checkout.updateCheckout(
            'post',
            '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/consignments',
            {
                ...cartReadyForMultiShipping,
                consignments: [
                    {
                        ...consignment,
                        availableShippingOptions: undefined,
                        selectedShippingOption: undefined,
                    },
                ],
            },
        );
        // eslint-disable-next-line testing-library/no-unnecessary-act
        await act(async () => {
            await userEvent.click(screen.getByText(/Ship to multiple addresses/i));
            await userEvent.click(screen.getByText(/Enter a new address/i));
            await userEvent.click(screen.getByText(/789 Test Ave/i));
            await userEvent.click(screen.getByText(/Allocate items/i));
            await userEvent.click(screen.getByText(/Select all items left/i));
            await userEvent.click(screen.getByRole('button', { name: 'Allocate' }));
            await userEvent.click(
                await screen.findByRole('button', { name: 'Add new destination' }),
            );
        });

        expect(
            screen.getByText(
                "Unfortunately one or more items in your cart can't be shipped to your location. Please choose a different delivery address.",
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                language.translate('shipping.multishipping_incomplete_consignment_error', {
                    consignmentNumber: 1,
                }),
            ),
        ).toBeInTheDocument();
        expect(checkoutService.selectConsignmentShippingOption).not.toHaveBeenCalled();

        checkout.updateCheckout(
            'post',
            '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/consignments',
            {
                ...cartReadyForMultiShipping,
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
                ...cartReadyForMultiShipping,
                consignments: [
                    {
                        ...consignment,
                        selectedShippingOption: consignment.availableShippingOptions?.[0],
                    },
                ],
            },
        );

        // eslint-disable-next-line testing-library/no-unnecessary-act
        await act(async () => {
            await userEvent.click(
                screen.getByText(/checkout test, 130 Pitt St, Sydney, New South Wales, AU, 2000/i),
            );
            await userEvent.click(screen.getByText(/123 Example St/i));
        });

        expect(checkoutService.selectConsignmentShippingOption).toHaveBeenCalled();
        expect(screen.getByLabelText(/Pickup In Store/i)).toBeInTheDocument();
        expect(screen.getByRole('radio', { checked: true })).toBeInTheDocument();
        expect(screen.getByRole('radio', { checked: false })).toBeInTheDocument();

        checkout.updateCheckout(
            'put',
            '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/consignments/consignment-1',
            {
                ...cartReadyForMultiShipping,
                consignments: [
                    {
                        ...consignment,
                        selectedShippingOption: consignment.availableShippingOptions?.[1],
                    },
                ],
            },
        );

        // eslint-disable-next-line testing-library/no-unnecessary-act
        await act(async () => {
            await userEvent.click(screen.getByLabelText(/Flat Rate/i));
        });

        const selectedShippingOptionValue2 = screen
            .getByRole('radio', { checked: true })
            .getAttribute('value');

        expect(selectedShippingOptionValue2).toBe('option-id-flat-rate');
        expect(
            screen.queryByText(
                language.translate('shipping.multishipping_incomplete_consignment_error', {
                    consignmentNumber: 1,
                }),
            ),
        ).not.toBeInTheDocument();
    });
});
