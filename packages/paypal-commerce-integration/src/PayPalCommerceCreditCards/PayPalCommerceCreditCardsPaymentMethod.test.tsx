/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */
import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
    createLanguageService,
    type PaymentMethod,
} from '@bigcommerce/checkout-sdk';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { type FunctionComponent } from 'react';

import { type CreditCardPaymentMethodValues } from '@bigcommerce/checkout/credit-card-integration';
import {
    createLocaleContext,
    LocaleContext,
    type LocaleContextType,
} from '@bigcommerce/checkout/locale';
import {
    CheckoutProvider,
    PaymentFormContext,
    type PaymentFormService,
    type PaymentMethodProps,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    getCart,
    getCheckout,
    getConsignment,
    getCustomer,
    getPaymentFormServiceMock,
    getPaymentMethod,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import PayPalCommerceCreditCardsPaymentMethod from './PayPalCommerceCreditCardsPaymentMethod';

describe('PayPalCommerceCreditCardPaymentMethod', () => {
    let initialValues: CreditCardPaymentMethodValues;
    let method: PaymentMethod;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: PaymentMethodProps;
    let localeContext: LocaleContextType;
    let PaymentMethodTest: FunctionComponent<PaymentMethodProps>;
    let paymentForm: PaymentFormService;

    beforeEach(() => {
        initialValues = {
            ccCustomerCode: '',
            ccCvv: '',
            ccExpiry: '',
            ccName: '',
            ccNumber: '',
            instrumentId: '',
        };
        paymentForm = getPaymentFormServiceMock();
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        localeContext = createLocaleContext(getStoreConfig());
        method = { ...getPaymentMethod(), id: 'paypalcommercecreditcards' };

        defaultProps = {
            method,
            checkoutService,
            checkoutState,
            paymentForm,
            language: createLanguageService(),
            onUnhandledError: jest.fn(),
        };

        jest.spyOn(checkoutService, 'loadInstruments').mockResolvedValue(checkoutState);
        jest.spyOn(checkoutService, 'deinitializePayment').mockResolvedValue(checkoutState);
        jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(checkoutState);

        jest.spyOn(checkoutState.data, 'getCart').mockReturnValue(getCart());
        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());
        jest.spyOn(checkoutState.data, 'getConsignments').mockReturnValue([getConsignment()]);
        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());
        jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue([]);
        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(true);
        jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue(getCheckout());

        PaymentMethodTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <PaymentFormContext.Provider value={{ paymentForm }}>
                    <LocaleContext.Provider value={localeContext}>
                        <Formik initialValues={initialValues} onSubmit={noop}>
                            <PayPalCommerceCreditCardsPaymentMethod {...props} />
                        </Formik>
                    </LocaleContext.Provider>
                </PaymentFormContext.Provider>
            </CheckoutProvider>
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders as credit card payment method component', () => {
        render(<PaymentMethodTest {...defaultProps} />);

        expect(document.querySelector('.paymentMethod--creditCard')).toBeInTheDocument();
    });

    it('initializes payment method when component mounts', async () => {
        render(<PaymentMethodTest {...defaultProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(checkoutService.initializePayment).toHaveBeenCalled();
    });

    it('calls initializePayment with correct arguments', async () => {
        render(<PaymentMethodTest {...defaultProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(checkoutService.initializePayment).toHaveBeenCalledWith(
            expect.objectContaining({
                methodId: 'paypalcommercecreditcards',
                paypalcommercecreditcards: expect.any(Object),
            }),
        );
    });

    it('calls deinitializePayment with correct arguments on unmount', () => {
        const { unmount } = render(<PaymentMethodTest {...defaultProps} />);

        unmount();

        expect(checkoutService.deinitializePayment).toHaveBeenCalledWith({
            methodId: 'paypalcommercecreditcards',
        });
    });

    it('calls getHostedFormOptions and returns styles with all expected child options', async () => {
        render(<PaymentMethodTest {...defaultProps} />);
        await new Promise((resolve) => process.nextTick(resolve));

        const call = (checkoutService.initializePayment as jest.Mock).mock.calls[0][0];

        if (call.paypalcommercecreditcards?.form) {
            const options = await call.paypalcommercecreditcards.form();

            expect(options).toHaveProperty('styles');
            ['default', 'error', 'focus'].forEach((styleKey) => {
                expect(options.styles).toHaveProperty(styleKey);
                expect(options.styles[styleKey]).toHaveProperty('color');
                expect(options.styles[styleKey]).toHaveProperty('fontFamily');
                expect(options.styles[styleKey]).toHaveProperty('fontSize');
                expect(options.styles[styleKey]).toHaveProperty('fontWeight');
            });
        }
    });

    it('calls all functions in getHostedFormOptions', async () => {
        render(<PaymentMethodTest {...defaultProps} />);
        await new Promise((resolve) => process.nextTick(resolve));

        const call = (checkoutService.initializePayment as jest.Mock).mock.calls[0][0];

        if (call.paypalcommercecreditcards?.form) {
            const options = await call.paypalcommercecreditcards.form();

            expect(typeof options.onBlur).toBe('function');
            expect(typeof options.onCardTypeChange).toBe('function');
            expect(typeof options.onEnter).toBe('function');
            expect(typeof options.onFocus).toBe('function');
            expect(typeof options.onValidate).toBe('function');

            // Call each function to ensure they are callable
            expect(() => options.onBlur({ fieldType: 'cardNumber' })).not.toThrow();
            expect(() => options.onCardTypeChange({ cardType: 'visa' })).not.toThrow();
            expect(() => options.onEnter()).not.toThrow();
            expect(() => options.onFocus({ fieldType: 'cardNumber' })).not.toThrow();
            expect(() =>
                options.onValidate({
                    errors: {
                        cardNumber: [{ type: 'required' }],
                    },
                }),
            ).not.toThrow();
        }
    });

    it('getHostedFormOptions returns correct fields for selectedInstrument with required verifications', async () => {
        // Simulate selectedInstrument with both isInstrumentCardNumberRequired and isInstrumentCardCodeRequired returning true
        const selectedInstrument = {
            bigpayToken: 'test-token',
        };

        const isInstrumentCardNumberRequiredSelector = jest.fn().mockReturnValue(true);
        const isInstrumentCardCodeRequiredSelector = jest.fn().mockReturnValue(true);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (defaultProps.checkoutState as any).data.isInstrumentCardNumberRequired =
            isInstrumentCardNumberRequiredSelector;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (defaultProps.checkoutState as any).data.isInstrumentCardCodeRequired =
            isInstrumentCardCodeRequiredSelector;

        render(<PaymentMethodTest {...defaultProps} />);
        await new Promise((resolve) => process.nextTick(resolve));

        const call = (checkoutService.initializePayment as jest.Mock).mock.calls[0][0];

        if (call.paypalcommercecreditcards?.form) {
            const options = await call.paypalcommercecreditcards.form(selectedInstrument);

            expect(options.fields.cardCodeVerification).toEqual(
                expect.objectContaining({
                    accessibilityLabel: expect.any(String),
                    containerId: expect.any(String),
                    instrumentId: selectedInstrument.bigpayToken,
                }),
            );
            expect(options.fields.cardNumberVerification).toEqual(
                expect.objectContaining({
                    accessibilityLabel: expect.any(String),
                    containerId: expect.any(String),
                    instrumentId: selectedInstrument.bigpayToken,
                }),
            );
            expect(options.fields.cardExpiryVerification).toEqual(
                expect.objectContaining({
                    accessibilityLabel: expect.any(String),
                    containerId: expect.any(String),
                    instrumentId: selectedInstrument.bigpayToken,
                }),
            );
        }
    });

    it('getHostedFormOptions returns correct fields for selectedInstrument with no required verifications', async () => {
        // Simulate selectedInstrument with both isInstrumentCardNumberRequired and isInstrumentCardCodeRequired returning false
        const selectedInstrument = {
            bigpayToken: 'test-token',
        };

        const isInstrumentCardNumberRequiredSelector = jest.fn().mockReturnValue(false);
        const isInstrumentCardCodeRequiredSelector = jest.fn().mockReturnValue(false);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (defaultProps.checkoutState as any).data.isInstrumentCardNumberRequired =
            isInstrumentCardNumberRequiredSelector;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (defaultProps.checkoutState as any).data.isInstrumentCardCodeRequired =
            isInstrumentCardCodeRequiredSelector;

        render(<PaymentMethodTest {...defaultProps} />);
        await new Promise((resolve) => process.nextTick(resolve));

        const call = (checkoutService.initializePayment as jest.Mock).mock.calls[0][0];

        if (call.paypalcommercecreditcards?.form) {
            const options = await call.paypalcommercecreditcards.form(selectedInstrument);

            expect(options.fields.cardCodeVerification).toBeUndefined();
            expect(options.fields.cardNumberVerification).toBeUndefined();
            expect(options.fields.cardExpiryVerification).toBeUndefined();
        }
    });

    it('getHostedFormOptions returns correct fields when not using instrument', async () => {
        render(<PaymentMethodTest {...defaultProps} />);
        await new Promise((resolve) => process.nextTick(resolve));

        const call = (checkoutService.initializePayment as jest.Mock).mock.calls[0][0];

        if (call.paypalcommercecreditcards?.form) {
            const options = await call.paypalcommercecreditcards.form();

            expect(options.fields.cardCode).toEqual(
                expect.objectContaining({
                    accessibilityLabel: expect.any(String),
                    containerId: expect.any(String),
                }),
            );
            expect(options.fields.cardExpiry).toEqual(
                expect.objectContaining({
                    accessibilityLabel: expect.any(String),
                    containerId: expect.any(String),
                    placeholder: expect.any(String),
                }),
            );
            expect(options.fields.cardName).toEqual(
                expect.objectContaining({
                    accessibilityLabel: expect.any(String),
                    containerId: expect.any(String),
                }),
            );
            expect(options.fields.cardNumber).toEqual(
                expect.objectContaining({
                    accessibilityLabel: expect.any(String),
                    containerId: expect.any(String),
                }),
            );
        }
    });

    it('getHostedFormOptions returns empty styles object if styleContainerId is undefined', async () => {
        // Simulate selectedInstrument with isInstrumentCardCodeRequired returning false
        const selectedInstrument = {
            bigpayToken: 'test-token',
        };

        const isInstrumentCardNumberRequiredSelector = jest.fn().mockReturnValue(false);
        const isInstrumentCardCodeRequiredSelector = jest.fn().mockReturnValue(false);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (defaultProps.checkoutState as any).data.isInstrumentCardNumberRequired =
            isInstrumentCardNumberRequiredSelector;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (defaultProps.checkoutState as any).data.isInstrumentCardCodeRequired =
            isInstrumentCardCodeRequiredSelector;

        render(<PaymentMethodTest {...defaultProps} />);
        await new Promise((resolve) => process.nextTick(resolve));

        const call = (checkoutService.initializePayment as jest.Mock).mock.calls[0][0];

        if (call.paypalcommercecreditcards?.form) {
            const options = await call.paypalcommercecreditcards.form(selectedInstrument);

            expect(options.styles).toEqual({});
        }
    });

    it('renders fallback form when isHostedFormEnabled is false', () => {
        defaultProps.method.config.isHostedFormEnabled = false;

        render(<PaymentMethodTest {...defaultProps} />);

        expect(document.querySelector('.paymentMethod--creditCard')).toBeInTheDocument();
    });

    it('renders with required customer code and cardholder name fields', () => {
        defaultProps.method.config.requireCustomerCode = true;
        defaultProps.method.config.showCardHolderName = true;

        render(<PaymentMethodTest {...defaultProps} />);

        expect(screen.getByText('Customer Code')).toBeInTheDocument();
        expect(screen.getByLabelText(/Name on Card/i)).toBeInTheDocument();
    });

    it('renders card code field if cardCode is true', () => {
        defaultProps.method.config.cardCode = true;

        render(<PaymentMethodTest {...defaultProps} />);

        expect(screen.getByLabelText(/CVV|Security Code|Card Code/i)).toBeInTheDocument();
    });

    it('calls onUnhandledError if error occurs during initializePayment', async () => {
        (checkoutService.initializePayment as jest.Mock).mockRejectedValueOnce(
            new Error('init error'),
        );

        render(<PaymentMethodTest {...defaultProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(defaultProps.onUnhandledError).toHaveBeenCalled();
    });

    it('sets validation schema if payment is required', () => {
        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(true);

        render(<PaymentMethodTest {...defaultProps} />);

        expect(paymentForm.setValidationSchema).toHaveBeenCalled();
    });

    it('deinitializes payment method when component unmounts', () => {
        const { unmount } = render(<PaymentMethodTest {...defaultProps} />);

        expect(checkoutService.deinitializePayment).not.toHaveBeenCalled();

        unmount();

        expect(checkoutService.deinitializePayment).toHaveBeenCalled();
    });

    it('renders loading overlay while waiting for method to initialize', () => {
        jest.spyOn(checkoutState.statuses, 'isLoadingInstruments').mockReturnValue(true);

        render(<PaymentMethodTest {...defaultProps} />);

        expect(document.getElementsByClassName('loadingOverlay')).toHaveLength(1);
    });

    it('renders customer code field if requireCustomerCode is true', () => {
        defaultProps.method.config.requireCustomerCode = true;

        render(<PaymentMethodTest {...defaultProps} />);

        expect(screen.getByText('Customer Code')).toBeInTheDocument();
    });

    it('renders save card checkbox if vaulting is enabled', () => {
        defaultProps.method.config.isVaultingEnabled = true;

        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());
        jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue([]);

        render(<PaymentMethodTest {...defaultProps} />);

        expect(screen.getByText('Save this card for future transactions')).toBeInTheDocument();
    });

    it('uses PaymentMethod to retrieve instruments', () => {
        render(<PaymentMethodTest {...defaultProps} />);

        expect(checkoutState.data.getInstruments).toHaveBeenCalledWith(defaultProps.method);
    });

    it('renders with save card checkbox if vaulting is enabled and no instruments', () => {
        defaultProps.method.config.isVaultingEnabled = true;
        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());
        jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue([]);

        render(<PaymentMethodTest {...defaultProps} />);

        expect(screen.getByText('Save this card for future transactions')).toBeInTheDocument();
    });

    it('does not render save card checkbox if vaulting is disabled', () => {
        defaultProps.method.config.isVaultingEnabled = false;
        jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue([]);

        render(<PaymentMethodTest {...defaultProps} />);

        expect(
            screen.queryByText('Save this card for future transactions'),
        ).not.toBeInTheDocument();
    });

    it('does not show instruments fieldset when there are no stored instruments', () => {
        defaultProps.method.config.isVaultingEnabled = false;

        jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue([]);

        render(<PaymentMethodTest {...defaultProps} />);

        expect(screen.queryByTestId('account-instrument-fieldset')).not.toBeInTheDocument();
    });
});
