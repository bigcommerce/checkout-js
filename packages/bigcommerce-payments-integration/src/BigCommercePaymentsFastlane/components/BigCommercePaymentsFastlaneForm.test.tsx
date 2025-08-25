import {
    type CheckoutSelectors,
    type CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
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

import BigCommercePaymentsFastlaneForm from './BigCommercePaymentsFastlaneForm';

configure({
    testIdAttribute: 'data-test',
});

describe('BigCommercePaymentsFastlaneForm', () => {
    let BigCommercePaymentsFastlaneFormMock: FunctionComponent;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let paymentForm: PaymentFormService;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        paymentForm = getPaymentFormServiceMock();

        jest.spyOn(checkoutState.data, 'getPaymentProviderCustomer').mockReturnValue({});

        BigCommercePaymentsFastlaneFormMock = () => (
            <CheckoutContext.Provider value={{ checkoutService, checkoutState }}>
                <PaymentFormContext.Provider value={{ paymentForm }}>
                    <Formik initialValues={{}} onSubmit={noop}>
                        <BigCommercePaymentsFastlaneForm />
                    </Formik>
                </PaymentFormContext.Provider>
            </CheckoutContext.Provider>
        );
    });

    afterAll(() => {
        jest.clearAllMocks();
    });

    it('shows bigcommerce payments instruments form', () => {
        jest.spyOn(checkoutState.data, 'getPaymentProviderCustomer').mockReturnValue({
            instruments: [getCardInstrument()],
        });

        render(<BigCommercePaymentsFastlaneFormMock />);

        expect(
            screen.getByTestId('big-commerce-payments-fastlane-instrument-form'),
        ).toBeInTheDocument();
    });

    it('shows bigcommerce payments fastlane credit card form if customer does not have any instrument', () => {
        render(<BigCommercePaymentsFastlaneFormMock />);

        expect(
            screen.getByTestId('big-commerce-payments-fastlane-cc-form-container'),
        ).toBeInTheDocument();
    });
});
