import {
    CheckoutService,
    createCheckoutService,
    createEmbeddedCheckoutMessenger,
    EmbeddedCheckoutMessenger,
} from '@bigcommerce/checkout-sdk';
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
    checkoutWithShipping,
    checkoutWithShippingAndBilling,
    consignment,
    payments,
} from '@bigcommerce/checkout/test-framework';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import Checkout, { CheckoutProps } from '../checkout/Checkout';
import { createErrorLogger } from '../common/error';
import {
    createEmbeddedCheckoutStylesheet,
    createEmbeddedCheckoutSupport,
} from '../embeddedCheckout';

describe('Checkout', () => {
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

    describe('Shipping step happy paths', () => {
        it('completes the shipping step as a guest and goes to payment step', async () => {
            jest.spyOn(checkoutService, 'updateShippingAddress');
            jest.spyOn(checkoutService, 'updateBillingAddress');
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            jest.mock('lodash', () => ({
                ...jest.requireActual('lodash'),
                debounce: (fn) => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    fn.cancel = jest.fn();

                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    return fn;
                },
            }));

            checkout.use(CheckoutPreset.CheckoutWithBillingEmail);

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

            await checkout.fillShippingAddress();

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
                screen.getByTestId('billingSameAsShipping').hasAttribute('checked'),
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
            expect(screen.getByText(payments[0].config.displayName)).toBeInTheDocument();

            jest.unmock('lodash');
        });
    });
});
