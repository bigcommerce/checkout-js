import {
    type AccountInstrument,
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
    createLanguageService,
    type PaymentMethod,
} from '@bigcommerce/checkout-sdk';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { type FunctionComponent } from 'react';
import { act } from 'react-dom/test-utils';

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
    PaymentMethodId,
    type PaymentMethodProps,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    getCart,
    getCheckout,
    getConsignment,
    getCustomer,
    getInstruments,
    getPaymentFormServiceMock,
    getPaymentMethod,
    getStoreConfig,
} from '@bigcommerce/checkout/test-mocks';
import { fireEvent, render, screen } from '@bigcommerce/checkout/test-utils';

import WorldpayCreditCardPaymentMethod from './WorldpayCreditCardPaymentMethod';

const hostedFormOptions = {
    fields: {
        cardCode: { containerId: 'cardCode', placeholder: 'Card code' },
        cardName: { containerId: 'cardName', placeholder: 'Card name' },
        cardNumber: { containerId: 'cardNumber', placeholder: 'Card number' },
        cardExpiry: { containerId: 'cardExpiry', placeholder: 'Card expiry' },
    },
};

describe('WorldpayCreditCardPaymentMethod', () => {
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
        method = { ...getPaymentMethod(), id: PaymentMethodId.WorldpayAccess };

        defaultProps = {
            method,
            checkoutService,
            checkoutState,
            paymentForm: getPaymentFormServiceMock(),
            language: createLanguageService(),
            onUnhandledError: jest.fn(),
        };
        jest.spyOn(checkoutService, 'loadInstruments').mockResolvedValue(checkoutState);

        jest.spyOn(checkoutState.data, 'getCart').mockReturnValue(getCart());

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutState.data, 'getConsignments').mockReturnValue([getConsignment()]);

        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());

        jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue([]);

        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(true);

        jest.spyOn(checkoutService, 'deinitializePayment').mockResolvedValue(checkoutState);

        jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(checkoutState);

        jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue(getCheckout());

        PaymentMethodTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <PaymentFormContext.Provider value={{ paymentForm }}>
                    <LocaleContext.Provider value={localeContext}>
                        <Formik initialValues={initialValues} onSubmit={noop}>
                            <WorldpayCreditCardPaymentMethod {...props} />
                        </Formik>
                    </LocaleContext.Provider>
                </PaymentFormContext.Provider>
            </CheckoutProvider>
        );
    });
    it('renders as credit card payment method component', () => {
        const { container } = render(<PaymentMethodTest {...defaultProps} />);

        expect(container.querySelector('.paymentMethod--creditCard')).toBeInTheDocument();
    });

    it('initializes payment method when component mounts', async () => {
        jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue(getInstruments());

        render(<PaymentMethodTest {...defaultProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(checkoutService.initializePayment).toHaveBeenCalledWith(
            expect.objectContaining({
                gatewayId: undefined,
                methodId: 'worldpayaccess',
                worldpay: {
                    onLoad: expect.any(Function),
                },
            }),
        );
    });

    it('does not set validation schema if payment is not required', () => {
        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(false);
        render(<PaymentMethodTest {...defaultProps} />);

        expect(paymentForm.setValidationSchema).toHaveBeenCalledTimes(0);
    });

    it('deinitializes payment method when component unmounts', () => {
        const { unmount } = render(<PaymentMethodTest {...defaultProps} />);

        expect(checkoutService.deinitializePayment).not.toHaveBeenCalled();

        unmount();

        expect(checkoutService.deinitializePayment).toHaveBeenCalled();
    });

    it('renders loading overlay while waiting for method to initialize', () => {
        jest.spyOn(checkoutState.statuses, 'isLoadingInstruments').mockReturnValue(true);

        const { container } = render(<PaymentMethodTest {...defaultProps} />);

        expect(container.getElementsByClassName('loadingOverlay')).toHaveLength(1);
    });

    it('renders modal that hosts worldpay payment page', async () => {
        render(<PaymentMethodTest {...defaultProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        const initializeOptions = (checkoutService.initializePayment as jest.Mock).mock.calls[0][0];

        act(() => {
            initializeOptions.worldpay.onLoad(document.createElement('iframe'), jest.fn());
        });

        await new Promise((resolve) => process.nextTick(resolve));

        expect(screen.getByTestId('modal-body')).toBeInTheDocument();
        expect(screen.getByText('Name on Card')).toBeInTheDocument();
    });

    it('renders modal', async () => {
        render(<PaymentMethodTest {...defaultProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        const initializeOptions = (checkoutService.initializePayment as jest.Mock).mock.calls[0][0];

        const iframe = document.createElement('iframe');

        act(() => {
            initializeOptions.worldpay.onLoad(iframe, jest.fn());
        });

        await new Promise((resolve) => process.nextTick(resolve));
        expect(screen.getByTestId('modal-body')).toBeInTheDocument();
    });

    it('renders field container with focus styles', () => {
        defaultProps.method.config.requireCustomerCode = true;

        render(<PaymentMethodTest {...defaultProps} />);

        expect(screen.getByText('Customer Code')).toBeInTheDocument();
    });

    it('cancels payment flow if user chooses to close modal', async () => {
        const cancelWorldpayPayment = jest.fn();

        render(<PaymentMethodTest {...defaultProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        const initializeOptions = (checkoutService.initializePayment as jest.Mock).mock.calls[0][0];

        act(() => {
            initializeOptions.worldpay.onLoad(
                document.createElement('iframe'),
                cancelWorldpayPayment,
            );
        });

        await new Promise((resolve) => process.nextTick(resolve));
        fireEvent.click(screen.getByText('Close'));

        expect(cancelWorldpayPayment).toHaveBeenCalledTimes(1);
    });

    describe('if stored instrument feature is available', () => {
        beforeEach(() => {
            defaultProps.method.config.isVaultingEnabled = true;

            jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());

            jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue(getInstruments());

            jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(checkoutState);

            jest.spyOn(checkoutService, 'loadInstruments').mockResolvedValue(checkoutState);
        });

        it('loads stored instruments when component mounts', async () => {
            render(<PaymentMethodTest {...defaultProps} />);

            await new Promise((resolve) => process.nextTick(resolve));

            expect(checkoutService.loadInstruments).toHaveBeenCalled();
        });

        it('only shows instruments fieldset when there is at least one stored instrument', async () => {
            const accountInstrument: AccountInstrument = {
                bigpayToken: '31415',
                provider: 'paypalcommerce',
                externalId: 'test@external-id.com',
                trustedShippingAddress: false,
                defaultInstrument: false,
                method: 'paypal',
                type: 'account',
            };

            jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue(getInstruments());
            jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue([
                {
                    ...accountInstrument,
                    trustedShippingAddress: true,
                },
            ]);
            render(<PaymentMethodTest {...defaultProps} />);
            await act(async () => {
                await new Promise((resolve) => setTimeout(resolve, 0));
            });

            expect(screen.getByText('Save this card for future transactions')).toBeInTheDocument();
        });

        it('does not show instruments fieldset when there are no stored instruments', () => {
            defaultProps.method.config.isVaultingEnabled = false;

            jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue([]);

            render(<PaymentMethodTest {...defaultProps} />);
            expect(
                screen.queryByText('Save this card for future transactions'),
            ).not.toBeInTheDocument();

            expect(screen.queryByTestId('account-instrument-fieldset')).not.toBeInTheDocument();
        });

        it('shows save credit card form when there are no stored instruments', () => {
            jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue([]);

            render(<PaymentMethodTest {...defaultProps} />);
            expect(screen.getByText('Save this card for future transactions')).toBeInTheDocument();
        });

        it('uses PaymentMethod to retrieve instruments', () => {
            render(<PaymentMethodTest {...defaultProps} />);

            expect(checkoutState.data.getInstruments).toHaveBeenCalledWith(defaultProps.method);
        });
    });
});
