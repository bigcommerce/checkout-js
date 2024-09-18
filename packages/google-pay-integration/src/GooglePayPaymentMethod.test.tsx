import '@testing-library/jest-dom';
import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
    PaymentInitializeOptions,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk';
import { Formik } from 'formik';
import each from 'jest-each';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import {
    createLocaleContext,
    LocaleContext,
    LocaleContextType,
} from '@bigcommerce/checkout/locale';
import {
    CheckoutProvider,
    getPaymentMethodName,
    PaymentFormContext,
    PaymentFormService,
    PaymentMethodId,
    PaymentMethodProps,
    PaymentMethodType,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    getAddress,
    getCheckout,
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

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

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

    it('initializes payment method when component mounts', () => {
        render(<GooglePayPaymentMethodTest {...defaultProps} />);

        expect(checkoutService.initializePayment).toHaveBeenCalled();
    });

    it('renders Visa Checkout as wallet button method', () => {
        render(<GooglePayPaymentMethodTest {...defaultProps} method={method} />);

        expect(
            screen.getByText(
                defaultProps.language.translate('remote.sign_in_action', {
                    providerName: getPaymentMethodName(defaultProps.language)(defaultProps.method),
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
        GooglePayPaymentMethodId.TdOnlineMartGooglePay,
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

                    onPaymentSelect: expect.any(Function),
                },
            }),
        );
    });

    each([
        GooglePayPaymentMethodId.AdyenV2GooglePay,
        GooglePayPaymentMethodId.AdyenV3GooglePay,
        GooglePayPaymentMethodId.AuthorizeNetGooglePay,
        GooglePayPaymentMethodId.BNZGooglePay,
        GooglePayPaymentMethodId.BraintreeGooglePay,
        GooglePayPaymentMethodId.PayPalCommerceGooglePay,
        GooglePayPaymentMethodId.CheckoutcomGooglePay,
        GooglePayPaymentMethodId.CybersourceV2GooglePay,
        GooglePayPaymentMethodId.OrbitalGooglePay,
        GooglePayPaymentMethodId.StripeGooglePay,
        GooglePayPaymentMethodId.StripeUPEGooglePay,
        GooglePayPaymentMethodId.WorldpayAccessGooglePay,
        GooglePayPaymentMethodId.TdOnlineMartGooglePay,
    ]).it(
        'reinitializes method once payment option is selected',
        async (id: GooglePayPaymentMethodId) => {
            method.id = id;
            render(<GooglePayPaymentMethodTest {...defaultProps} method={method} />);

            const options: PaymentInitializeOptions = (
                checkoutService.initializePayment as jest.Mock
            ).mock.calls[0][0];

            (checkoutService.initializePayment as jest.Mock).mockReset();

            options.googlepaybraintree!.onPaymentSelect!();

            options[id]!.onPaymentSelect!();

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
        },
    );

    each([
        GooglePayPaymentMethodId.AdyenV2GooglePay,
        GooglePayPaymentMethodId.AdyenV3GooglePay,
        GooglePayPaymentMethodId.AuthorizeNetGooglePay,
        GooglePayPaymentMethodId.BNZGooglePay,
        GooglePayPaymentMethodId.BraintreeGooglePay,
        GooglePayPaymentMethodId.PayPalCommerceGooglePay,
        GooglePayPaymentMethodId.CheckoutcomGooglePay,
        GooglePayPaymentMethodId.CybersourceV2GooglePay,
        GooglePayPaymentMethodId.OrbitalGooglePay,
        GooglePayPaymentMethodId.StripeGooglePay,
        GooglePayPaymentMethodId.StripeUPEGooglePay,
        GooglePayPaymentMethodId.WorldpayAccessGooglePay,
        GooglePayPaymentMethodId.TdOnlineMartGooglePay,
    ]).it(
        'catches error during component reinitialization',
        async (id: GooglePayPaymentMethodId) => {
            method.id = id;
            render(<GooglePayPaymentMethodTest {...defaultProps} method={method} />);
            jest.spyOn(checkoutService, 'initializePayment').mockImplementation(() =>
                Promise.reject(new Error('test error')),
            );

            const options: PaymentInitializeOptions = (
                checkoutService.initializePayment as jest.Mock
            ).mock.calls[0][0];

            options[id]!.onPaymentSelect!();

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
        },
    );
});
