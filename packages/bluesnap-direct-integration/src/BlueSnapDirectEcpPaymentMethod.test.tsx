import '@testing-library/jest-dom';
import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
    createLanguageService,
    type PaymentInitializeOptions,
    type PaymentRequestOptions,
} from '@bigcommerce/checkout-sdk';
import { createBlueSnapDirectAPMPaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/bluesnap-direct';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { type FunctionComponent } from 'react';

import {
    CheckoutContext,
    PaymentFormContext,
    type PaymentFormService,
    type PaymentMethodProps,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    getAddress,
    getCustomer,
    getGuestCustomer,
    getInstruments,
    getPaymentFormServiceMock,
} from '@bigcommerce/checkout/test-mocks';
import { act, fireEvent, render, screen } from '@bigcommerce/checkout/test-utils';

import BlueSnapDirectEcpPaymentMethod from './BlueSnapDirectEcpPaymentMethod';
import { BluesnapECPAccountType } from './constants';
import { getBlueSnapDirect } from './mocks/bluesnapdirect-method.mock';

describe('BlueSnapDirectEcp payment method', () => {
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
    let BlueSnapDirectEcpTest: FunctionComponent;
    let paymentForm: PaymentFormService;
    const method = getBlueSnapDirect('ecp');
    const methodWithVaulting = {
        ...method,
        config: {
            ...method.config,
            isVaultingEnabled: true,
        },
    };

    beforeEach(() => {
        initialValues = {
            accountNumber: '',
            routingNumber: '',
            accountType: BluesnapECPAccountType.CorporateChecking,
        };
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
        jest.spyOn(checkoutState.data, 'getBillingAddress').mockReturnValue({
            ...getAddress(),
            id: '1',
        });

        const formValues = {
            paymentProviderRadio: '', // legacy prop -> added due to the PaymentFormValues interface
            accountNumber: '',
            routingNumber: '',
            accountType: BluesnapECPAccountType.CorporateChecking,
            shouldSaveInstrument: false,
            shouldSetAsDefaultInstrument: false,
            instrumentId: '',
            orderConsent: false,
        };

        jest.spyOn(paymentForm, 'getFormValues').mockReturnValue(formValues);
        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(true);
        props = {
            method: methodWithVaulting,
            checkoutService,
            checkoutState,
            paymentForm,
            language: createLanguageService(),
            onUnhandledError: jest.fn(),
        };

        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());
        BlueSnapDirectEcpTest = () => (
            <Formik initialValues={initialValues} onSubmit={noop}>
                <CheckoutContext.Provider value={{ checkoutState, checkoutService }}>
                    <PaymentFormContext.Provider value={{ paymentForm }}>
                        <BlueSnapDirectEcpPaymentMethod {...props} />
                    </PaymentFormContext.Provider>
                </CheckoutContext.Provider>
            </Formik>
        );
    });

    it('should be initialized with the required config', () => {
        render(<BlueSnapDirectEcpTest />);

        expect(initializePayment).toHaveBeenCalledWith({
            gatewayId: 'bluesnapdirect',
            methodId: 'ecp',
            integrations: [createBlueSnapDirectAPMPaymentStrategy],
        });
    });

    it('loads instruments for signed in customer', () => {
        render(<BlueSnapDirectEcpTest />);

        expect(checkoutService.loadInstruments).toHaveBeenCalled();
    });

    it('should not load instruments for guest customers', () => {
        jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getGuestCustomer());

        render(<BlueSnapDirectEcpTest />);

        expect(checkoutService.loadInstruments).not.toHaveBeenCalled();
    });

    it('should enable submit button if user grants permission', () => {
        const {
            paymentForm: { disableSubmit },
            method: paymentMethod,
        } = props;

        render(<BlueSnapDirectEcpTest />);

        const permissionChangeCheckbox = screen.getByLabelText(
            props.language.translate('payment.bluesnap_direct_permission'),
        );

        fireEvent.click(permissionChangeCheckbox);

        expect(disableSubmit).toHaveBeenCalledTimes(2);
        expect(disableSubmit).toHaveBeenNthCalledWith(1, paymentMethod, true);
        expect(disableSubmit).toHaveBeenNthCalledWith(2, paymentMethod, false);
    });

    it('should be deinitialized with the required config', () => {
        render(<BlueSnapDirectEcpTest />).unmount();

        expect(deinitializePayment).toHaveBeenCalledWith({
            gatewayId: 'bluesnapdirect',
            methodId: 'ecp',
        });
    });

    it('populates company name value from the billing address', () => {
        jest.spyOn(paymentForm, 'setFieldValue');
        render(<BlueSnapDirectEcpTest />);

        expect(paymentForm.setFieldValue).toHaveBeenCalledWith('companyName', 'Bigcommerce');
    });

    it("clears company name value when company name field doesn't render", () => {
        const formValues = {
            paymentProviderRadio: '', // legacy prop -> added due to the PaymentFormValues interface
            accountNumber: '',
            routingNumber: '',
            accountType: BluesnapECPAccountType.ConsumerSavings,
            shouldSaveInstrument: false,
            shouldSetAsDefaultInstrument: false,
            instrumentId: '',
            orderConsent: false,
        };

        jest.spyOn(paymentForm, 'getFormValues').mockReturnValue(formValues);
        jest.spyOn(paymentForm, 'setFieldValue');
        render(<BlueSnapDirectEcpTest />);

        expect(paymentForm.setFieldValue).toHaveBeenCalledWith('companyName', undefined);
    });

    it('shows save instrument checkbox for registered customers', () => {
        render(<BlueSnapDirectEcpTest />);

        expect(screen.getByText('Save this account for future transactions')).toBeInTheDocument();
    });

    it('renders vaulting instruments select', async () => {
        const allInstruments = getInstruments();
        const achInstruments = allInstruments.filter((instrument) => instrument.method === 'ecp');

        jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue(achInstruments);

        render(<BlueSnapDirectEcpTest />);

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(screen.getByTestId('account-instrument-fieldset')).toBeInTheDocument();
        expect(screen.getByText('Account number ending in: 0001')).toBeInTheDocument();
        expect(screen.getByText('Routing Number: 011000016')).toBeInTheDocument();
    });
});
