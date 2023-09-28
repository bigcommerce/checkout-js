import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import {
    PaymentFormContext,
    PaymentFormService,
} from '@bigcommerce/checkout/payment-integration-api';
import { getPaymentFormServiceMock } from '@bigcommerce/checkout/test-mocks';
import { render } from '@bigcommerce/checkout/test-utils';

import { OwnershipTypes } from '../constants';

import BraintreeAchFormFields from './BraintreeAchFormFields';

describe('BraintreeAchFormFields Component', () => {
    let paymentForm: PaymentFormService;

    beforeEach(() => {
        paymentForm = getPaymentFormServiceMock();
    });

    it('should render form with personal fields', () => {
        jest.spyOn(paymentForm, 'getFieldValue').mockReturnValue(OwnershipTypes.Personal);

        const view = render(
            <Formik initialValues={{}} onSubmit={noop}>
                <PaymentFormContext.Provider value={{ paymentForm }}>
                    <BraintreeAchFormFields />
                </PaymentFormContext.Provider>
            </Formik>,
        );

        expect(view).toMatchSnapshot();
    });

    it('should render form with business fields', () => {
        jest.spyOn(paymentForm, 'getFieldValue').mockReturnValue(OwnershipTypes.Business);

        const view = render(
            <Formik initialValues={{}} onSubmit={noop}>
                <PaymentFormContext.Provider value={{ paymentForm }}>
                    <BraintreeAchFormFields />
                </PaymentFormContext.Provider>
            </Formik>,
        );

        expect(view).toMatchSnapshot();
    });
});
