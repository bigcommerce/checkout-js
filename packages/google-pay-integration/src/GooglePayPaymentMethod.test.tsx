import '@testing-library/jest-dom';
import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
    type PaymentInitializeOptions,
    type PaymentMethod,
} from '@bigcommerce/checkout-sdk';
import {
    createGooglePayAdyenV2PaymentStrategy,
    createGooglePayAdyenV3PaymentStrategy,
    createGooglePayAuthorizeNetPaymentStrategy,
    createGooglePayBigCommercePaymentsPaymentStrategy,
    createGooglePayBraintreePaymentStrategy,
    createGooglePayCheckoutComPaymentStrategy,
    createGooglePayCybersourcePaymentStrategy,
    createGooglePayOrbitalPaymentStrategy,
    createGooglePayPPCPPaymentStrategy,
    createGooglePayStripePaymentStrategy,
    createGooglePayTdOnlineMartPaymentStrategy,
    createGooglePayWorldpayAccessPaymentStrategy,
} from '@bigcommerce/checkout-sdk/integrations/google-pay';
import { Formik } from 'formik';
import each from 'jest-each';
import { noop } from 'lodash';
import React, { type FunctionComponent } from 'react';

import {
    CheckoutProvider,
    LocaleContext,
    type LocaleContextType,
    PaymentFormContext,
    type PaymentFormService,
} from '@bigcommerce/checkout/contexts';
import { createLocaleContext } from '@bigcommerce/checkout/locale';
import {
    getPaymentMethodName,
    PaymentMethodId,
    type PaymentMethodProps,
    PaymentMethodType,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    getAddress,
    getCheckout,
    getCheckoutPayment,
    getPaymentFormServiceMock,
    getPaymentMethod,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import GooglePayPaymentMethod from './GooglePayPaymentMethod';
import GooglePayPaymentMethodId from './GooglePayPaymentMethodId';

describe('when using Google Pay payment', () => {
    let method: PaymentMethod;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: PaymentMethodProps;
    let localeContext: LocaleContextType;
    let GooglePayPaymentMethodTest: FunctionComponent<PaymentMethodProps>;
    let paymentForm: PaymentFormService;
    const billingAddress = {
        ...getAddress(),
        id: '1113412341',
    };
    const onUnhandledError = jest.fn();

    const storeConfigWithDirectPayDisabled = {
        ...getStoreConfig(),
        checkoutSettings: {
            ...getStoreConfig().checkoutSettings,
            features: {
                ...getStoreConfig().checkoutSettings.features,
                'PI-5111.google_pay_direct_pay_on_click': false,
            },
        },
    };

    const storeConfigWithDirectPayEnabled = {
        ...getStoreConfig(),
        checkoutSettings: {
            ...getStoreConfig().checkoutSettings,
            features: {
                ...getStoreConfig().checkoutSettings.features,
                'PI-5111.google_pay_direct_pay_on_click': true,
            },
        },
    };

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        localeContext = createLocaleContext(getStoreConfig());
        paymentForm = getPaymentFormServiceMock();
        method = {
            ...getPaymentMethod(),
            id: PaymentMethodId.BraintreeGooglePay,
            method: PaymentMethodType.GooglePay,
        };
        jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue(getCheckout());

        jest.spyOn(checkoutState.data, 'getBillingAddress').mockReturnValue(billingAddress);

        defaultProps = {
            method,
            onUnhandledError,
            checkoutState,
            checkoutService,
            paymentForm,
            language: localeContext.language,
        };

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(
            storeConfigWithDirectPayDisabled,
        );

        jest.spyOn(checkoutService, 'deinitializePayment').mockResolvedValue(checkoutState);

        jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(checkoutState);

        GooglePayPaymentMethodTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <PaymentFormContext.Provider value={{ paymentForm }}>
                    <LocaleContext.Provider value={localeContext}>
                        <Formik initialValues={{}} onSubmit={noop}>
                            <GooglePayPaymentMethod {...props} />
                        </Formik>
                    </LocaleContext.Provider>
                </PaymentFormContext.Provider>
            </CheckoutProvider>
        );
    });

    describe('when direct pay is disabled (PI-5111 = false)', () => {
        it('initializes payment method when component mounts', () => {
            render(<GooglePayPaymentMethodTest {...defaultProps} />);

            expect(checkoutService.initializePayment).toHaveBeenCalledWith(
                expect.objectContaining({
                    integrations: [
                        createGooglePayAdyenV2PaymentStrategy,
                        createGooglePayAdyenV3PaymentStrategy,
                        createGooglePayAuthorizeNetPaymentStrategy,
                        createGooglePayCheckoutComPaymentStrategy,
                        createGooglePayCybersourcePaymentStrategy,
                        createGooglePayOrbitalPaymentStrategy,
                        createGooglePayStripePaymentStrategy,
                        createGooglePayWorldpayAccessPaymentStrategy,
                        createGooglePayBraintreePaymentStrategy,
                        createGooglePayPPCPPaymentStrategy,
                        createGooglePayBigCommercePaymentsPaymentStrategy,
                        createGooglePayTdOnlineMartPaymentStrategy,
                    ],
                }),
            );
        });

        it('renders Visa Checkout as wallet button method', () => {
            render(<GooglePayPaymentMethodTest {...defaultProps} method={method} />);

            expect(
                screen.getByText(
                    defaultProps.language.translate('remote.sign_in_action', {
                        providerName: getPaymentMethodName(defaultProps.language)(
                            defaultProps.method,
                        ),
                    }),
                ),
            ).toBeInTheDocument();
        });

        each([
            PaymentMethodId.AdyenV2GooglePay,
            PaymentMethodId.AdyenV3GooglePay,
            PaymentMethodId.AuthorizeNetGooglePay,
            PaymentMethodId.BNZGooglePay,
            PaymentMethodId.BraintreeGooglePay,
            PaymentMethodId.PayPalCommerceGooglePay,
            PaymentMethodId.CheckoutcomGooglePay,
            PaymentMethodId.CybersourceV2GooglePay,
            PaymentMethodId.OrbitalGooglePay,
            PaymentMethodId.StripeGooglePay,
            PaymentMethodId.StripeUPEGooglePay,
            PaymentMethodId.WorldpayAccessGooglePay,
            GooglePayPaymentMethodId.tdOnlineMartGooglePay,
        ]).it('initializes %s with required config', (id: PaymentMethodId) => {
            method.id = id;

            render(<GooglePayPaymentMethodTest {...defaultProps} method={method} />);

            expect(checkoutService.initializePayment).toHaveBeenCalledWith(
                expect.objectContaining({
                    methodId: id,
                    gatewayId: method.gateway,
                    [id]: {
                        walletButton: 'walletButton',
                        onError: defaultProps.onUnhandledError,
                        loadingContainerId: 'checkout-app',
                        onPaymentSelect: expect.any(Function),
                    },
                }),
            );
        });

        each([
            GooglePayPaymentMethodId.adyenV2GooglePay,
            GooglePayPaymentMethodId.adyenV3GooglePay,
            GooglePayPaymentMethodId.authorizeNetGooglePay,
            GooglePayPaymentMethodId.bnzGooglePay,
            GooglePayPaymentMethodId.braintreeGooglePay,
            GooglePayPaymentMethodId.payPalCommerceGooglePay,
            GooglePayPaymentMethodId.bigcommercePaymentsGooglePay,
            GooglePayPaymentMethodId.checkoutcomGooglePay,
            GooglePayPaymentMethodId.cybersourceV2GooglePay,
            GooglePayPaymentMethodId.orbitalGooglePay,
            GooglePayPaymentMethodId.stripeGooglePay,
            GooglePayPaymentMethodId.stripeUPEGooglePay,
            GooglePayPaymentMethodId.worldpayAccessGooglePay,
            GooglePayPaymentMethodId.tdOnlineMartGooglePay,
        ]).it('reinitializes method once payment option is selected', async (id: string) => {
            method.id = id;
            render(<GooglePayPaymentMethodTest {...defaultProps} method={method} />);

            const options: PaymentInitializeOptions = (
                checkoutService.initializePayment as jest.Mock
            ).mock.calls[0][0];

            (checkoutService.initializePayment as jest.Mock).mockReset();

            options.googlepaybraintree!.onPaymentSelect!();

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (options as Record<string, any>)[id]!.onPaymentSelect!();

            await new Promise((resolve) => process.nextTick(resolve));

            expect(checkoutService.deinitializePayment).toHaveBeenCalledWith({
                methodId: method.id,
            });
            expect(checkoutService.initializePayment).toHaveBeenCalledWith(
                expect.objectContaining({
                    methodId: method.id,

                    [method.id]: expect.any(Object),
                }),
            );
        });

        each([
            GooglePayPaymentMethodId.adyenV2GooglePay,
            GooglePayPaymentMethodId.adyenV3GooglePay,
            GooglePayPaymentMethodId.authorizeNetGooglePay,
            GooglePayPaymentMethodId.bnzGooglePay,
            GooglePayPaymentMethodId.braintreeGooglePay,
            GooglePayPaymentMethodId.payPalCommerceGooglePay,
            GooglePayPaymentMethodId.bigcommercePaymentsGooglePay,
            GooglePayPaymentMethodId.checkoutcomGooglePay,
            GooglePayPaymentMethodId.cybersourceV2GooglePay,
            GooglePayPaymentMethodId.orbitalGooglePay,
            GooglePayPaymentMethodId.stripeGooglePay,
            GooglePayPaymentMethodId.stripeUPEGooglePay,
            GooglePayPaymentMethodId.worldpayAccessGooglePay,
            GooglePayPaymentMethodId.tdOnlineMartGooglePay,
        ]).it('catches error during component reinitialization', async (id: string) => {
            method.id = id;
            render(<GooglePayPaymentMethodTest {...defaultProps} method={method} />);
            jest.spyOn(checkoutService, 'initializePayment').mockImplementation(() =>
                Promise.reject(new Error('test error')),
            );

            const options: PaymentInitializeOptions = (
                checkoutService.initializePayment as jest.Mock
            ).mock.calls[0][0];

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (options as Record<string, any>)[id]!.onPaymentSelect!();

            await new Promise((resolve) => process.nextTick(resolve));

            expect(checkoutService.deinitializePayment).toHaveBeenCalledWith({
                methodId: method.id,
            });
            expect(checkoutService.initializePayment).toHaveBeenCalledWith(
                expect.objectContaining({
                    methodId: method.id,

                    [method.id]: expect.any(Object),
                }),
            );

            expect(defaultProps.onUnhandledError).toHaveBeenCalled();
        });
    });

    describe('when direct pay is enabled (PI-5111 = true)', () => {
        beforeEach(() => {
            jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(
                storeConfigWithDirectPayEnabled,
            );
        });

        it('does not render the wallet sign-in button', () => {
            render(<GooglePayPaymentMethodTest {...defaultProps} />);

            expect(
                screen.queryByText(
                    defaultProps.language.translate('remote.sign_in_action', {
                        providerName: getPaymentMethodName(defaultProps.language)(
                            defaultProps.method,
                        ),
                    }),
                ),
            ).not.toBeInTheDocument();
        });

        it('renders the direct-pay branch so the SDK can inject the branded button', () => {
            render(<GooglePayPaymentMethodTest {...defaultProps} />);

            expect(screen.getByText('direct pay enabled!!!!!!')).toBeInTheDocument();
        });

        it('keeps the direct-pay component when checkout.payments is updated mid-flow', () => {
            jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue(getCheckout());

            const { rerender } = render(<GooglePayPaymentMethodTest {...defaultProps} />);

            // Simulate loadCheckout() populating checkout.payments during the sheet interaction
            jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue({
                ...getCheckout(),
                payments: [{ ...getCheckoutPayment(), providerId: method.id }],
            });

            rerender(<GooglePayPaymentMethodTest {...defaultProps} />);

            // Wallet sign-in UI must NOT appear — direct-pay component stays
            expect(
                screen.queryByText(
                    defaultProps.language.translate('remote.sign_in_action', {
                        providerName: getPaymentMethodName(defaultProps.language)(
                            defaultProps.method,
                        ),
                    }),
                ),
            ).not.toBeInTheDocument();

            // The direct-pay branch is still rendered
            expect(screen.getByText('direct pay enabled!!!!!!')).toBeInTheDocument();
        });
    });

    describe('when payment is already selected (express-entry flow)', () => {
        beforeEach(() => {
            jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue({
                ...getCheckout(),
                payments: [{ ...getCheckoutPayment(), providerId: method.id }],
            });
        });

        it('renders the wallet UI with a sign-out option regardless of the feature flag', () => {
            jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(
                storeConfigWithDirectPayEnabled,
            );

            render(<GooglePayPaymentMethodTest {...defaultProps} />);

            // When payment is already selected, WalletButtonPaymentMethodComponent shows
            // the signed-in view (sign-out link) rather than the GooglePayPaymentMethodComponent.
            expect(
                screen.getByText(
                    defaultProps.language.translate('remote.sign_out_action', {
                        providerName: getPaymentMethodName(defaultProps.language)(
                            defaultProps.method,
                        ),
                    }),
                ),
            ).toBeInTheDocument();
        });
    });
});
