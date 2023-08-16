import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
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

import BraintreeAcceleratedCheckoutInstrumentFieldset from './BraintreeAcceleratedCheckoutInstrumentFieldset';

describe('BraintreeAcceleratedCheckoutInstrumentFieldset', () => {
    let BraintreeAcceleratedCheckoutInstrumentFieldsetMock: FunctionComponent;
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

        BraintreeAcceleratedCheckoutInstrumentFieldsetMock = () => (
            <LocaleContext.Provider value={localeContext}>
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
            </LocaleContext.Provider>
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
