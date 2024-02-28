import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import '@testing-library/jest-dom';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import {
    CheckoutContext,
    PaymentFormContext,
    PaymentFormService,
} from '@bigcommerce/checkout/payment-integration-api';
import { getCardInstrument, getPaymentFormServiceMock } from '@bigcommerce/checkout/test-mocks';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import PayPalCommerceFastlaneForm from './PayPalCommerceFastlaneForm';

describe('PayPalCommerceFastlaneForm', () => {
    let PayPalCommerceFastlaneFormMock: FunctionComponent;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let paymentForm: PaymentFormService;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        paymentForm = getPaymentFormServiceMock();

        jest.spyOn(checkoutState.data, 'getPaymentProviderCustomer').mockReturnValue({});

        PayPalCommerceFastlaneFormMock = () => (
            <CheckoutContext.Provider value={{ checkoutService, checkoutState }}>
                <PaymentFormContext.Provider value={{ paymentForm }}>
                    <Formik initialValues={{}} onSubmit={noop}>
                        <PayPalCommerceFastlaneForm />
                    </Formik>
                </PaymentFormContext.Provider>
            </CheckoutContext.Provider>
        );
    });

    afterAll(() => {
        jest.clearAllMocks();
    });

    it('shows paypal commerce instruments form', () => {
        jest.spyOn(checkoutState.data, 'getPaymentProviderCustomer').mockReturnValue({
            instruments: [getCardInstrument()],
        });

        render(<PayPalCommerceFastlaneFormMock />);

        expect(screen.getByTestId('paypal-commerce-fastlane-instrument-form')).toBeInTheDocument();
    });

    it('shows paypal fastlane credit card form if customer does not have any instrument', () => {
        render(<PayPalCommerceFastlaneFormMock />);

        expect(screen.getByTestId('paypal-commerce-fastlane-cc-form-container')).toBeInTheDocument();
    });
});
