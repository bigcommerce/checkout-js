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
import { render } from '@bigcommerce/checkout/test-utils';

import BraintreeAcceleratedCheckoutInstrumentFieldset from './BraintreeAcceleratedCheckoutInstrumentFieldset';

describe('BraintreeAcceleratedCheckoutInstrumentFieldset', () => {
    let BraintreeAcceleratedCheckoutInstrumentFieldsetMock: FunctionComponent;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let paymentForm: PaymentFormService;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        paymentForm = getPaymentFormServiceMock();

        jest.spyOn(checkoutState.data, 'getPaymentProviderCustomer').mockReturnValue({});

        BraintreeAcceleratedCheckoutInstrumentFieldsetMock = () => (
            <CheckoutContext.Provider value={{ checkoutService, checkoutState }}>
                <PaymentFormContext.Provider value={{ paymentForm }}>
                    <Formik initialValues={{}} onSubmit={noop}>
                        <BraintreeAcceleratedCheckoutInstrumentFieldset
                            instruments={[getCardInstrument()]}
                            onSelectInstrument={noop}
                            onUseNewInstrument={noop}
                        />
                    </Formik>
                </PaymentFormContext.Provider>
            </CheckoutContext.Provider>
        );
    });

    afterAll(() => {
        jest.clearAllMocks();
    });

    it('shows select with vaulted instruments', () => {
        const view = render(<BraintreeAcceleratedCheckoutInstrumentFieldsetMock />);

        expect(view).toMatchSnapshot();
    });
});
