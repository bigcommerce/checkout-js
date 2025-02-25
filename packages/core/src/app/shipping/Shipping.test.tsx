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
import { render, screen, within } from '@bigcommerce/checkout/test-utils';

import Checkout, { CheckoutProps } from '../checkout/Checkout';
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
                            <Checkout {...props} />
                        </ExtensionProvider>
                    </AnalyticsProviderMock>
                </LocaleProvider>
            </CheckoutProvider>
        );
    });

    describe('Shipping step happy paths', () => {
        it('completes the shipping step as a guest and goes to the payment step by default', async () => {
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
        });

        it('completes the shipping step as a guest and goes to the billing step', async () => {
            checkout.use(CheckoutPreset.CheckoutWithBillingEmail);

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

            await checkout.fillShippingAddress();
            await userEvent.click(screen.getByTestId('billingSameAsShipping'));
            await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
            await checkout.waitForBillingStep();

            expect(checkoutService.updateBillingAddress).not.toHaveBeenCalled();
            // one `edit` button is for the cart, the other is for the shipping address.
            expect(screen.getAllByRole('button', { name: 'Edit' })).toHaveLength(2);
            expect(screen.getByLabelText('First Name')).toBeInTheDocument();
        });
    });

    it('renders and validates shipping form built-in and customfields', async () => {
        checkout.use(CheckoutPreset.CheckoutWithBillingEmailAndCustomFormFields);
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

        await checkout.fillShippingAddress();
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
});
