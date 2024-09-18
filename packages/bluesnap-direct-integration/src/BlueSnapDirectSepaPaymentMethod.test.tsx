import '@testing-library/jest-dom';
import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
    createLanguageService,
    PaymentInitializeOptions,
    PaymentRequestOptions,
} from '@bigcommerce/checkout-sdk';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import {
    CheckoutContext,
    PaymentFormContext,
    PaymentFormService,
    PaymentMethodProps,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    getCustomer,
    getGuestCustomer,
    getInstruments,
    getPaymentFormServiceMock,
} from '@bigcommerce/checkout/test-mocks';
import { act, fireEvent, render, screen } from '@bigcommerce/checkout/test-utils';

import BlueSnapDirectSepaPaymentMethod from './BlueSnapDirectSepaPaymentMethod';
import { getBlueSnapDirect } from './mocks/bluesnapdirect-method.mock';

describe('BlueSnapDirectSepa payment method', () => {
    let checkoutService: CheckoutService;
    let initializePayment: jest.SpyInstance<
        Promise<CheckoutSelectors>,
        [options: PaymentInitializeOptions]
    >;
    let deinitializePayment: jest.SpyInstance<
        Promise<CheckoutSelectors>,
        [options: PaymentRequestOptions]
    >;
    let checkoutState: CheckoutSelectors;
    let props: PaymentMethodProps;
    let initialValues: { [key: string]: unknown };
    let BlueSnapDirectSepaTest: FunctionComponent;
    let paymentForm: PaymentFormService;
    const method = getBlueSnapDirect('sepa_direct_debit');
    const methodWithVaulting = {
        ...method,
        config: {
            ...method.config,
            isVaultingEnabled: true,
        },
    };

    beforeEach(() => {
        checkoutService = createCheckoutService();
        paymentForm = getPaymentFormServiceMock();
        initializePayment = jest
            .spyOn(checkoutService, 'initializePayment')
            .mockResolvedValue(checkoutState);
        deinitializePayment = jest
            .spyOn(checkoutService, 'deinitializePayment')
            .mockResolvedValue(checkoutState);
        checkoutState = checkoutService.getState();
        jest.spyOn(checkoutService, 'loadInstruments').mockResolvedValue(checkoutState);
        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(true);
        props = {
            method: methodWithVaulting,
            checkoutService,
            checkoutState,
            paymentForm,
            language: createLanguageService(),
            onUnhandledError: jest.fn(),
        };
        initialValues = {
            iban: '',
            firstName: '',
            lastName: '',
            routingNumber: '',
        };
        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());
        BlueSnapDirectSepaTest = () => (
            <Formik initialValues={initialValues} onSubmit={noop}>
                <CheckoutContext.Provider value={{ checkoutState, checkoutService }}>
                    <PaymentFormContext.Provider value={{ paymentForm }}>
                        <BlueSnapDirectSepaPaymentMethod {...props} />
                    </PaymentFormContext.Provider>
                </CheckoutContext.Provider>
            </Formik>
        );
    });

    it('should be initialized with the required config', () => {
        render(<BlueSnapDirectSepaTest />);

        expect(initializePayment).toHaveBeenCalledWith({
            gatewayId: 'bluesnapdirect',
            methodId: 'sepa_direct_debit',
        });
    });

    it('loads instruments for signed in customer', () => {
        render(<BlueSnapDirectSepaTest />);

        expect(checkoutService.loadInstruments).toHaveBeenCalled();
    });

    it('should not load instruments for guest customers', () => {
        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getGuestCustomer());

        render(<BlueSnapDirectSepaTest />);

        expect(checkoutService.loadInstruments).not.toHaveBeenCalled();
    });

    it('should enable submit button if user grants permission', () => {
        const {
            paymentForm: { disableSubmit },
            method,
        } = props;

        render(<BlueSnapDirectSepaTest />);

        const permissionChangeCheckbox = screen.getByLabelText(
            props.language.translate('payment.bluesnap_direct_sepa_mandate_disclaimer', {
                creditorName: 'Sepa Creditor Company Name',
            }),
        );

        fireEvent.click(permissionChangeCheckbox);

        expect(disableSubmit).toHaveBeenCalledTimes(2);
        expect(disableSubmit).toHaveBeenNthCalledWith(1, method, true);
        expect(disableSubmit).toHaveBeenNthCalledWith(2, method, false);
    });

    it('should be deinitialized with the required config', () => {
        render(<BlueSnapDirectSepaTest />).unmount();

        expect(deinitializePayment).toHaveBeenCalledWith({
            gatewayId: 'bluesnapdirect',
            methodId: 'sepa_direct_debit',
        });
    });

    it('shows save instrument checkbox for registered customers', () => {
        render(<BlueSnapDirectSepaTest />);

        expect(screen.getByText('Save this account for future transactions')).toBeInTheDocument();
    });

    it('renders vaulting instruments select', async () => {
        const allInstruments = getInstruments();
        const sepaInstruments = allInstruments.filter(
            (instrument) => instrument.method === 'sepa_direct_debit',
        );

        jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue(sepaInstruments);

        render(<BlueSnapDirectSepaTest />);

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(screen.getByTestId('account-instrument-fieldset')).toBeInTheDocument();
        expect(screen.getByText('Account Number (IBAN): DE133123xx111')).toBeInTheDocument();
    });
});
