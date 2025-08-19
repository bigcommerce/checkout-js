import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import '@testing-library/jest-dom';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { type FunctionComponent } from 'react';

import {
    CheckoutContext,
    PaymentFormContext,
    type PaymentFormService,
} from '@bigcommerce/checkout/payment-integration-api';
import { getCardInstrument, getPaymentFormServiceMock } from '@bigcommerce/checkout/test-mocks';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import BraintreeFastlaneForm from './BraintreeFastlaneForm';

describe('BraintreeFastlaneForm', () => {
    let BraintreeFastlaneFormMock: FunctionComponent;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let paymentForm: PaymentFormService;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        paymentForm = getPaymentFormServiceMock();

        jest.spyOn(checkoutState.data, 'getPaymentProviderCustomer').mockReturnValue({});

        BraintreeFastlaneFormMock = () => (
            <CheckoutContext.Provider value={{ checkoutService, checkoutState }}>
                <PaymentFormContext.Provider value={{ paymentForm }}>
                    <Formik initialValues={{}} onSubmit={noop}>
                        <BraintreeFastlaneForm />
                    </Formik>
                </PaymentFormContext.Provider>
            </CheckoutContext.Provider>
        );
    });

    afterAll(() => {
        jest.clearAllMocks();
    });

    it('shows braintree fastlane instruments form', () => {
        jest.spyOn(checkoutState.data, 'getPaymentProviderCustomer').mockReturnValue({
            instruments: [getCardInstrument()],
        });

        render(<BraintreeFastlaneFormMock />);

        expect(screen.getByTestId('braintree-fastlane-instrument-form')).toBeInTheDocument();
    });

    it('shows braintree fastlane credit card form if customer does not have any instrument', () => {
        render(<BraintreeFastlaneFormMock />);

        expect(screen.getByTestId('braintree-fastlane-cc-form-container')).toBeInTheDocument();
    });
});
