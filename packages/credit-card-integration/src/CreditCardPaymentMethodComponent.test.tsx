import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
    type PaymentMethod,
} from '@bigcommerce/checkout-sdk';
import EventEmitter from 'events';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { type FunctionComponent } from 'react';
import { object, type Schema, string } from 'yup';

import {
    getCreditCardValidationSchema,
    getInstrumentValidationSchema,
} from '@bigcommerce/checkout/instrument-utils';
import {
    createLocaleContext,
    LocaleContext,
    type LocaleContextType,
} from '@bigcommerce/checkout/locale';
import {
    CheckoutContext,
    PaymentFormContext,
    type PaymentFormService,
    type PaymentMethodProps,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    getCardInstrument,
    getCart,
    getConsignment,
    getCustomer,
    getInstruments,
    getPaymentFormServiceMock,
    getPaymentMethod,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import CreditCardPaymentMethodComponent, {
    type CreditCardPaymentMethodProps,
    type CreditCardPaymentMethodValues,
} from './CreditCardPaymentMethodComponent';

describe('CreditCardPaymentMethod', () => {
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: jest.Mocked<CreditCardPaymentMethodProps & PaymentMethodProps>;
    let initialValues: CreditCardPaymentMethodValues;
    let localeContext: LocaleContextType;
    let paymentForm: PaymentFormService;
    let subscribeEventEmitter: EventEmitter;
    let CreditCardPaymentMethodTest: FunctionComponent<
        CreditCardPaymentMethodProps & PaymentMethodProps
    >;

    beforeEach(() => {
        initialValues = {
            ccCustomerCode: '',
            ccCvv: '',
            ccExpiry: '',
            ccName: '',
            ccNumber: '',
            instrumentId: '',
        };

        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        localeContext = createLocaleContext(getStoreConfig());
        subscribeEventEmitter = new EventEmitter();
        paymentForm = getPaymentFormServiceMock();

        defaultProps = {
            checkoutService,
            checkoutState,
            language: localeContext.language,
            onUnhandledError: jest.fn(),
            paymentForm,
            method: getPaymentMethod(),
            deinitializePayment: jest.fn(),
            initializePayment: jest.fn(),
        };

        jest.spyOn(checkoutService, 'getState').mockReturnValue(checkoutState);

        jest.spyOn(checkoutService, 'subscribe').mockImplementation((subscriber) => {
            subscribeEventEmitter.on('change', () => subscriber(checkoutState));
            subscribeEventEmitter.emit('change');

            return noop;
        });

        jest.spyOn(checkoutService, 'loadInstruments').mockResolvedValue(checkoutState);

        jest.spyOn(checkoutState.data, 'getCart').mockReturnValue(getCart());

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutState.data, 'getConsignments').mockReturnValue([getConsignment()]);

        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());

        jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue([]);

        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(true);

        CreditCardPaymentMethodTest = (props) => {
            return (
                <LocaleContext.Provider value={createLocaleContext(getStoreConfig())}>
                    <CheckoutContext.Provider value={{ checkoutService, checkoutState }}>
                        <PaymentFormContext.Provider value={{ paymentForm }}>
                            <Formik initialValues={initialValues} onSubmit={noop}>
                                <CreditCardPaymentMethodComponent {...props} />
                            </Formik>
                        </PaymentFormContext.Provider>
                    </CheckoutContext.Provider>
                </LocaleContext.Provider>
            );
        };
    });

    it('initializes payment method when component mounts', () => {
        const instruments = getInstruments();

        jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue(instruments);

        render(<CreditCardPaymentMethodTest {...defaultProps} />);

        expect(defaultProps.initializePayment).toHaveBeenCalledWith(
            {
                gatewayId: defaultProps.method.gateway,
                methodId: defaultProps.method.id,
            },
            instruments[0],
        );
    });

    it('sets validation schema for credit cards when component mounts', () => {
        render(<CreditCardPaymentMethodTest {...defaultProps} />);

        expect(paymentForm.setValidationSchema).toHaveBeenCalled();

        const schema: Schema<any> = (paymentForm.setValidationSchema as jest.Mock).mock.calls[0][1];
        const expectedSchema = getCreditCardValidationSchema({
            isCardCodeRequired: true,
            language: localeContext.language,
        });

        expect(Object.keys(schema.describe().fields)).toEqual(
            Object.keys(expectedSchema.describe().fields),
        );
    });

    it('uses custom validation schema if passed', () => {
        const expectedSchema = object({
            ccCvv: string(),
            ccExpiry: string(),
            ccName: string(),
            ccNumber: string(),
        });

        render(
            <CreditCardPaymentMethodTest {...defaultProps} cardValidationSchema={expectedSchema} />,
        );

        expect(paymentForm.setValidationSchema).toHaveBeenCalled();

        const schema: Schema<any> = (paymentForm.setValidationSchema as jest.Mock).mock.calls[0][1];

        expect(Object.keys(schema.describe().fields)).toEqual(
            Object.keys(expectedSchema.describe().fields),
        );
    });

    it('does not set validation schema if payment is not required', () => {
        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(false);

        render(<CreditCardPaymentMethodTest {...defaultProps} />);

        expect(paymentForm.setValidationSchema).toHaveBeenCalledWith(defaultProps.method, null);
    });

    it('deinitializes payment method when component unmounts', () => {
        jest.spyOn(checkoutService, 'deinitializePayment').mockResolvedValue(
            checkoutService.getState(),
        );

        const { unmount } = render(<CreditCardPaymentMethodTest {...defaultProps} />);

        unmount();

        expect(defaultProps.deinitializePayment).toHaveBeenCalled();
    });

    it('renders loading overlay while waiting for method to initialize', () => {
        const { container } = render(
            <CreditCardPaymentMethodTest {...defaultProps} isInitializing />,
        );

        // eslint-disable-next-line testing-library/no-container
        expect(container.querySelector('.loadingOverlay-container')).not.toBeNull();
    });

    it('renders custom credit card fieldset if passed', () => {
        const FoobarFieldset = <div>Foobar</div>;

        render(<CreditCardPaymentMethodTest {...defaultProps} cardFieldset={FoobarFieldset} />);

        expect(screen.getByText('Foobar')).toBeInTheDocument();
    });

    it('does not render credit card code fieldset if card code is false', () => {
        const newMethod = { ...getPaymentMethod(), config: { cardCode: false } };

        render(<CreditCardPaymentMethodTest {...defaultProps} method={newMethod} />);

        expect(
            screen.queryByText(localeContext.language.translate('payment.credit_card_cvv_label')),
        ).not.toBeInTheDocument();
    });

    describe('if stored instrument feature is available', () => {
        let vaultedMethod: PaymentMethod;

        beforeEach(() => {
            jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue(getInstruments());

            jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(checkoutState);

            vaultedMethod = {
                ...getPaymentMethod(),
                config: {
                    ...getPaymentMethod().config,
                    isVaultingEnabled: true,
                },
            };
        });

        it('initializes payment method with stored card validation fieldset', () => {
            const getStoredCardValidationFieldset = jest.fn();

            render(
                <CreditCardPaymentMethodTest
                    {...defaultProps}
                    getStoredCardValidationFieldset={getStoredCardValidationFieldset}
                    method={vaultedMethod}
                />,
            );

            expect(checkoutService.loadInstruments).toHaveBeenCalledWith();
            expect(getStoredCardValidationFieldset).toHaveBeenCalled();
        });

        it('sets validation schema for stored instruments when component mounts', () => {
            jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue([
                {
                    ...getCardInstrument(),
                    trustedShippingAddress: false,
                },
            ]);

            render(<CreditCardPaymentMethodTest {...defaultProps} method={vaultedMethod} />);

            expect(paymentForm.setValidationSchema).toHaveBeenCalled();

            const schema: Schema<any> = (paymentForm.setValidationSchema as jest.Mock).mock
                .calls[0][1];
            const expectedSchema = getInstrumentValidationSchema({
                instrumentBrand: 'american_express',
                instrumentLast4: '4444',
                isCardCodeRequired: true,
                isCardNumberRequired: true,
                language: localeContext.language,
            });

            expect(Object.keys(schema.describe().fields)).toEqual(
                Object.keys(expectedSchema.describe().fields),
            );
        });

        it('does not show instruments fieldset when there are no stored instruments', () => {
            jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue([]);

            render(<CreditCardPaymentMethodTest {...defaultProps} />);
            expect(screen.queryByText('payment.instrument_text')).not.toBeInTheDocument();
        });

        it('shows save credit card form when there are no stored instruments', () => {
            jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue([]);

            render(<CreditCardPaymentMethodTest {...defaultProps} method={vaultedMethod} />);

            expect(
                screen.getByText(
                    localeContext.language.translate(
                        'payment.instrument_save_payment_method_label',
                    ),
                ),
            ).toBeInTheDocument();
        });

        it('uses PaymentMethod to retrieve instruments', () => {
            render(<CreditCardPaymentMethodTest {...defaultProps} />);

            expect(checkoutState.data.getInstruments).toHaveBeenCalledWith(defaultProps.method);
        });

        it('switches to "use new card" view if all instruments are deleted', () => {
            const { rerender } = render(
                <CreditCardPaymentMethodTest {...defaultProps} method={vaultedMethod} />,
            );

            expect(
                screen.queryByText(
                    localeContext.language.translate(
                        'payment.instrument_save_payment_method_label',
                    ),
                ),
            ).not.toBeInTheDocument();

            jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue([]);

            subscribeEventEmitter.emit('change');

            rerender(<CreditCardPaymentMethodTest {...defaultProps} method={vaultedMethod} />);

            expect(
                screen.getByText(
                    localeContext.language.translate(
                        'payment.instrument_save_payment_method_label',
                    ),
                ),
            ).toBeInTheDocument();
        });
    });
});
