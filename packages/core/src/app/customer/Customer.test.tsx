import { CheckoutService, createCheckoutService, createEmbeddedCheckoutMessenger, EmbeddedCheckoutMessenger } from "@bigcommerce/checkout-sdk";
import faker from "@faker-js/faker";
import userEvent from "@testing-library/user-event";
import { noop } from "lodash";
import React, { FunctionComponent } from 'react';

import { AnalyticsContextProps, AnalyticsEvents, AnalyticsProviderMock } from "@bigcommerce/checkout/analytics";
import { ExtensionProvider } from "@bigcommerce/checkout/checkout-extension";
import { getLanguageService, LocaleProvider } from "@bigcommerce/checkout/locale";
import { CHECKOUT_ROOT_NODE_ID, CheckoutProvider } from "@bigcommerce/checkout/payment-integration-api";
import { cartWithBillingEmail, CheckoutPageNodeObject } from "@bigcommerce/checkout/test-framework";
import { render, screen } from "@bigcommerce/checkout/test-utils";

import Checkout, { CheckoutProps } from "../checkout/Checkout";
import { createErrorLogger } from "../common/error";
import { createEmbeddedCheckoutStylesheet, createEmbeddedCheckoutSupport } from "../embeddedCheckout";

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
        checkout.use('CartWithBillingEmail');

        render(<CheckoutTest {...defaultProps} />);

        await checkout.waitForShippingStep();

        expect(screen.getByText(cartWithBillingEmail.billingAddress.email)).toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', {
            name: 'Edit'
        }))

        await checkout.waitForCustomerStep();

        const newEmail = faker.internet.email();

        await userEvent.clear(await screen.findByLabelText('Email'));
        await userEvent.type(await screen.findByLabelText('Email'), newEmail);

        checkout.updateCheckout(
            'put',
            '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/billing-address/undefined',
            {
                ...cartWithBillingEmail,
                billingAddress: {
                    ...cartWithBillingEmail.billingAddress,
                    email: newEmail,
                }
            }
        );

        await userEvent.click(await screen.findByText('Continue'));

        expect(screen.getByText(newEmail)).toBeInTheDocument();
    });
});
