import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import {
    createLocaleContext,
    LocaleContext,
    LocaleContextType,
} from '@bigcommerce/checkout/locale';
import {
    CheckoutContext,
    PaymentFormContext,
    PaymentFormService,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    getCardInstrument,
    getPaymentFormServiceMock,
    getStoreConfig,
} from '@bigcommerce/checkout/test-utils';

import BraintreeAcceleratedCheckoutForm from './BraintreeAcceleratedCheckoutForm';

describe('BraintreeAcceleratedCheckoutForm', () => {
    let BraintreeAcceleratedCheckoutFormMock: FunctionComponent;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let paymentForm: PaymentFormService;
    let localeContext: LocaleContextType;

    beforeEach(() => {
        localeContext = createLocaleContext(getStoreConfig());
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        paymentForm = getPaymentFormServiceMock();

        jest.spyOn(checkoutState.data, 'getPaymentProviderCustomer').mockReturnValue({});

        BraintreeAcceleratedCheckoutFormMock = () => (
            <LocaleContext.Provider value={localeContext}>
                <CheckoutContext.Provider value={{ checkoutService, checkoutState }}>
                    <PaymentFormContext.Provider value={{ paymentForm }}>
                        <Formik initialValues={{}} onSubmit={noop}>
                            <BraintreeAcceleratedCheckoutForm />
                        </Formik>
                    </PaymentFormContext.Provider>
                </CheckoutContext.Provider>
            </LocaleContext.Provider>
        );
    });

    afterAll(() => {
        jest.clearAllMocks();
    });

    it('shows select with instruments', () => {
        jest.spyOn(checkoutState.data, 'getPaymentProviderCustomer').mockReturnValue({
            instruments: [getCardInstrument()],
        });

        render(<BraintreeAcceleratedCheckoutFormMock />);

        expect(screen.getByTestId('instrument-select')).toBeInTheDocument();
    });

    it('shows paypal connect form if there are no instruments', () => {
        render(<BraintreeAcceleratedCheckoutFormMock />);

        expect(screen.getByTestId('braintree-axo-cc-form-container')).toBeInTheDocument();
    });

    it('shows paypal connect form if new instrument should be created', async () => {
        jest.spyOn(checkoutState.data, 'getPaymentProviderCustomer').mockReturnValue({
            instruments: [getCardInstrument()],
        });

        render(<BraintreeAcceleratedCheckoutFormMock />);

        fireEvent.click(screen.getByTestId('instrument-select-button'));

        await new Promise((resolve) => process.nextTick(resolve));

        fireEvent.click(screen.getByTestId('instrument-select-option-use-new'));

        await new Promise((resolve) => process.nextTick(resolve));

        expect(screen.getByTestId('instrument-select')).toBeInTheDocument();
        expect(screen.getByTestId('braintree-axo-cc-form-container')).toBeInTheDocument();
    });
});
