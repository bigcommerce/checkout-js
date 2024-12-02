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
                        <ExtensionProvider checkoutService={checkoutService}>
                            <Checkout {...props} />
                        </ExtensionProvider>
                    </AnalyticsProviderMock>
                </LocaleProvider>
            </CheckoutProvider>
        );
    });

    it('renders multi-shipping v2 component and finishes the shipping step', async () => {
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
            await userEvent.click(screen.getByText(/Choose a shipping address/i));
            await userEvent.click(screen.getByText(/789 Test Ave/i));
            await userEvent.click(screen.getByText(/Allocate items/i));
            await userEvent.click(screen.getByText(/Select all items left/i));
            await userEvent.click(screen.getByRole('button', { name: 'Allocate' }));
            await userEvent.click(
                await screen.findByRole('button', { name: 'Add new destination' }),
            );
        });

        checkout.updateCheckout(
            'post',
            '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/consignments',
            {
                ...cartReadyForMultiShipping,
                consignments: [
                    {
                        ...consignment,
                    },
                ],
            },
        );

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

        await userEvent.click(
            screen.getByText(/checkout test, 130 Pitt St, Sydney, New South Wales, AU, 2000/i),
        );
        await userEvent.click(screen.getByText(/123 Example St/i));

        expect(await screen.findAllByRole('radio')).toHaveLength(2);
        expect(screen.getByLabelText(/Pickup In Store/i)).toBeInTheDocument();

        const selectedShippingOptionValue1 = screen
            .getByRole('radio', { checked: true })
            .getAttribute('value');

        expect(selectedShippingOptionValue1).toBe('option-id-pick-up');

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
        await userEvent.click(screen.getByLabelText(/Flat Rate/i));

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
