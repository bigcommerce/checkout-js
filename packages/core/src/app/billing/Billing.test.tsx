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
    checkoutWithShippingAndBilling,
    payments,
} from '@bigcommerce/checkout/test-framework';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import Checkout, { CheckoutProps } from '../checkout/Checkout';
import { createErrorLogger } from '../common/error';
import {
    createEmbeddedCheckoutStylesheet,
    createEmbeddedCheckoutSupport,
} from '../embeddedCheckout';

describe('Billing step', () => {
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
                            <Checkout {...props} />
                        </ExtensionProvider>
                    </AnalyticsProviderMock>
                </LocaleProvider>
            </CheckoutProvider>
        );
    });

    it('completes the billing step as a guest and goes to the payment step', async () => {
        checkout.use(CheckoutPreset.CheckoutWithShipping);

        render(<CheckoutTest {...defaultProps} />);

        await checkout.waitForBillingStep();

        await checkout.fillAddressForm();

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
    });

    it('edit the billing address and goes back to the payment step', async () => {
        checkout.use(CheckoutPreset.CheckoutWithShippingAndBilling);

        render(<CheckoutTest {...defaultProps} />);

        await checkout.waitForPaymentStep();

        expect(screen.getByText(payments[0].config.displayName)).toBeInTheDocument();

        await userEvent.click(screen.getAllByRole('button', { name: 'Edit' })[2]);

        await checkout.waitForBillingStep();

        await checkout.fillAddressForm();

        expect(screen.queryByLabelText('Save this address in my address book.')).not.toBeInTheDocument();

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
    });
});
