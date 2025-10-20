import {
    type BillingAddress,
    type CheckoutService,
    createCheckoutService,
    createEmbeddedCheckoutMessenger,
    type EmbeddedCheckoutMessenger,
} from '@bigcommerce/checkout-sdk';
import userEvent from '@testing-library/user-event';
import { noop } from 'lodash';
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
    checkoutWithDigitalCart,
    checkoutWithShipping,
    checkoutWithShippingAndBilling,
    consignment,
    customer,
    formFields,
    payments,
    shippingAddress,
    shippingAddress2,
    shippingAddress3,
} from '@bigcommerce/checkout/test-framework';
import { act, renderWithoutWrapper as render, screen } from '@bigcommerce/checkout/test-utils';

import Checkout from '../checkout/Checkout';
import { type CheckoutIntermediateProps } from '../checkout/CheckoutIntermediate';
import { getCheckoutPayment } from '../checkout/checkouts.mock';
import { createErrorLogger } from '../common/error';
import {
    createEmbeddedCheckoutStylesheet,
    createEmbeddedCheckoutSupport,
} from '../embeddedCheckout';

describe('Billing step', () => {
    let checkout: CheckoutPageNodeObject;
    let CheckoutTest: FunctionComponent<CheckoutIntermediateProps>;
    let checkoutService: CheckoutService;
    let defaultProps: CheckoutIntermediateProps & AnalyticsContextProps;
    let embeddedMessengerMock: EmbeddedCheckoutMessenger;
    let analyticsTracker: Partial<AnalyticsEvents>;

    const checkoutWithCustomer = {
        ...checkoutWithShipping,
        customer,
    }

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
                            <ThemeProvider>
                                <Checkout {...props} />
                            </ThemeProvider>
                        </ExtensionProvider>
                    </AnalyticsProviderMock>
                </LocaleProvider>
            </CheckoutProvider>
        );
    });

    it('completes the billing step as a guest and goes to the payment step', async () => {
        checkoutService = checkout.use(CheckoutPreset.CheckoutWithShipping);

        jest.spyOn(checkoutService, 'updateBillingAddress');

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
        expect(screen.getByRole('radio', { name: payments[0].config.displayName })).toBeInTheDocument();
    });

    it('edit the billing address and goes back to the payment step', async () => {
        checkoutService = checkout.use(CheckoutPreset.CheckoutWithShippingAndBilling);

        jest.spyOn(checkoutService, 'updateBillingAddress');

        render(<CheckoutTest {...defaultProps} />);

        await checkout.waitForPaymentStep();

        expect(screen.getByRole('radio', { name: payments[0].config.displayName })).toBeInTheDocument();

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
        expect(screen.getByRole('radio', { name: payments[0].config.displayName })).toBeInTheDocument();
    });

    it('should show order comments', async () => {
        defaultProps.initialState = {
            config: checkoutSettings,
            checkout: {
                ...checkoutWithBillingEmail,
                cart: checkoutWithDigitalCart.cart,
            },
            formFields,
            extensions: [],
        };

        render(<CheckoutTest {...defaultProps} />);

        await checkout.waitForBillingStep();

        expect(screen.getAllByText('Order Comments')).toHaveLength(2);
    });

    it('should show PoweredByPayPalFastlaneLabel', async () => {
        defaultProps.initialState = {
            config: checkoutSettings,
            checkout: {
                ...checkoutWithShipping,
                billingAddress:checkoutWithBillingEmail.billingAddress,
                payments:[
                    getCheckoutPayment(),
                ],
            },
            formFields,
            extensions: [],
        };

        render(<CheckoutTest {...defaultProps} />);

        await checkout.waitForPaymentStep();

        expect(screen.getByText('Managed by Amazon Pay')).toBeInTheDocument();
    });

    it('should show PoweredByPayPalFastlaneLabel and custom form fields', async () => {
        checkoutService = checkout.use(CheckoutPreset.CheckoutWithBillingEmailAndCustomFormFields, {
            config: checkoutSettings,
            checkout: {
                ...checkoutWithShipping,
                billingAddress:checkoutWithBillingEmail.billingAddress,
                consignments: [
                    {
                        ...consignment,
                        shippingAddress:{
                            ...consignment.shippingAddress,
                            'customFields': [
                                {
                                    'fieldId': 'field_25',
                                    'fieldValue': 'Custom Text'
                                },
                                {
                                    'fieldId': 'field_27',
                                    'fieldValue': '1'
                                },
                                {
                                    'fieldId': 'field_28',
                                    'fieldValue': 'Custom message text'
                                },
                                {
                                    'fieldId': 'field_29',
                                    'fieldValue': '2020-01-01'
                                },
                                {
                                    'fieldId': 'field_31',
                                    'fieldValue': ['0', '1']
                                },
                                {
                                    'fieldId': 'field_32',
                                    'fieldValue': '0'
                                },
                                {
                                    'fieldId': 'field_33',
                                    'fieldValue': 3
                                }
                            ]
                        },

                    }
                ],
                payments:[
                    getCheckoutPayment(),
                ],
            },
            formFields,
        });

        render(<CheckoutTest {...defaultProps} />);

        await checkout.waitForBillingStep();

        await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

        expect(screen.getByText('Managed by Amazon Pay')).toBeInTheDocument();
        expect(screen.getByText('Custom Text is required')).toBeInTheDocument();
        expect(screen.getByText('Custom Date is required')).toBeInTheDocument();
        expect(screen.getByText('Custom Number is required')).toBeInTheDocument();
        expect(screen.getByText('Custom Checkbox is required')).toBeInTheDocument();
        expect(screen.getByText('Custom Radio is required')).toBeInTheDocument();
        expect(screen.getByText('Custom Dropdown is required')).toBeInTheDocument();
    });

    describe('registered customer', () => {
        it('completes the billing step after selecting a valid address', async () => {
            defaultProps.initialState = {
                config: checkoutSettings,
                checkout: checkoutWithCustomer,
                formFields,
                extensions: [],
            };

            jest.spyOn(checkoutService, 'updateBillingAddress');

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForBillingStep();

            checkout.updateCheckout(
                'put',
                '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/billing-address/billing-address-id',
                {
                    ...checkoutWithShippingAndBilling,
                    billingAddress: {
                        ...checkoutWithShippingAndBilling.billingAddress,
                        firstName: shippingAddress3.firstName,
                        lastName: shippingAddress3.lastName,
                        address1: shippingAddress3.address1,
                        city: shippingAddress3.city,
                        stateOrProvince: shippingAddress3.stateOrProvince,
                        stateOrProvinceCode: shippingAddress3.stateOrProvinceCode,
                        country: shippingAddress3.country,
                        countryCode: shippingAddress3.countryCode,
                        postalCode: shippingAddress3.postalCode,
                        phone: shippingAddress3.phone,
                    } as BillingAddress,
                }
            );

            await act(async () => {
                await userEvent.click(screen.getByText('Enter a new address'));
                await userEvent.click(screen.getByText(shippingAddress3.address1));

                expect(checkoutService.updateBillingAddress).toHaveBeenCalled();
                expect(screen.queryByLabelText('First Name')).not.toBeInTheDocument();
                expect(screen.queryByRole('textbox', { name: /address/i })).not.toBeInTheDocument();

                await userEvent.click(screen.getByText('Continue'));
            });

            await checkout.waitForPaymentStep();

            expect(screen.getByRole('radio', { name: payments[0].config.displayName })).toBeInTheDocument();
        });

        it('completes the billing step after selecting an invalid address', async () => {
            const invalidBillingAddress = {
                ...checkoutWithShippingAndBilling.billingAddress,
                firstName: '',
                lastName: shippingAddress3.lastName,
                address1: shippingAddress3.address1,
                city: shippingAddress3.city,
                stateOrProvince: shippingAddress3.stateOrProvince,
                stateOrProvinceCode: shippingAddress3.stateOrProvinceCode,
                country: shippingAddress3.country,
                countryCode: shippingAddress3.countryCode,
                postalCode: shippingAddress3.postalCode,
                phone: shippingAddress3.phone,
            } as BillingAddress;

            defaultProps.initialState ={
                config: checkoutSettings,
                checkout: checkoutWithCustomer,
                formFields,
                extensions: [],
            };

            jest.spyOn(checkoutService, 'updateBillingAddress');

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForBillingStep();

            checkout.updateCheckout(
                'put',
                '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/billing-address/billing-address-id',
                {
                    ...checkoutWithShippingAndBilling,
                    billingAddress: invalidBillingAddress,
                }
            );

            await act(async () => {
                await userEvent.click(screen.getByText('Enter a new address'));
                await userEvent.click(screen.getByText(shippingAddress3.address1));
            });

            expect(checkoutService.updateBillingAddress).toHaveBeenCalled();
            expect(screen.getByLabelText('First Name')).toBeInTheDocument();
            expect(screen.getByRole('textbox', { name: /address/i })).toHaveDisplayValue(shippingAddress3.address1);

            checkout.updateCheckout(
                'put',
                '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/billing-address/billing-address-id',
                {
                    ...checkoutWithShippingAndBilling,
                    billingAddress: {
                        ...invalidBillingAddress,
                        firstName: shippingAddress3.firstName,
                    },
                }
            );

            await act(async () => {
                await userEvent.type(await screen.findByLabelText('First Name'), shippingAddress3.address1);
                await userEvent.click(screen.getByText('Continue'));
            });

            await checkout.waitForPaymentStep();

            expect(screen.getByRole('radio', { name: payments[0].config.displayName })).toBeInTheDocument();
        });

        it('completes the billing step after creating a new address even with existing addresses', async () => {
            defaultProps.initialState = {
                config: checkoutSettings,
                checkout: checkoutWithCustomer,
                formFields,
                extensions: [],
            };

            jest.spyOn(checkoutService, 'updateBillingAddress');

            render(<CheckoutTest {...defaultProps} />);

            await checkout.waitForBillingStep();

            expect(screen.getByLabelText('First Name')).toBeInTheDocument();
            expect(screen.getByRole('textbox', { name: /address/i })).toHaveDisplayValue('');

            await userEvent.click(screen.getByText('Enter a new address'));

            expect(screen.getAllByText(shippingAddress.address1)).toHaveLength(2); // another one in Shipping step
            expect(screen.getByText(shippingAddress2.address1)).toBeInTheDocument();
            expect(screen.getByText(shippingAddress3.address1)).toBeInTheDocument();

            checkout.updateCheckout(
                'put',
                '/checkouts/xxxxxxxxxx-xxxx-xxax-xxxx-xxxxxx/billing-address/billing-address-id',
                checkoutWithShippingAndBilling,
            );

            await userEvent.click(screen.getByText('First Name'));
            await checkout.fillAddressForm();
            await userEvent.click(screen.getByText('Continue'));
            await checkout.waitForPaymentStep();

            expect(checkoutService.updateBillingAddress).toHaveBeenCalled();
            expect(screen.getByRole('radio', { name: payments[0].config.displayName })).toBeInTheDocument();
        });
    });
});
