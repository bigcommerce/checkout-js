import { createCheckoutService, createLanguageService } from '@bigcommerce/checkout-sdk';
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
    PaymentMethodProps,
} from '@bigcommerce/checkout/payment-integration-api';
import { getPaymentFormServiceMock, getStoreConfig } from '@bigcommerce/checkout/test-mocks';

import BraintreeTrustlyLocalPaymentMethod from './BraintreeTrustlyLocalPaymentMethod';
import { getBraintreeLocalMethodMock } from './mocks/braintreeLocalMethodsMocks';

describe('BraintreeTrustlyLocalPaymentMethod', () => {
    let BraintreeTrustlyLocalPaymentMethodTest: FunctionComponent<PaymentMethodProps>;
    let localeContext: LocaleContextType;
    const checkoutService = createCheckoutService();
    const checkoutState = checkoutService.getState();
    const paymentForm = getPaymentFormServiceMock();

    const props = {
        method: {
            ...getBraintreeLocalMethodMock(),
            id: 'trustly',
        },
        checkoutService,
        checkoutState,
        paymentForm,

        language: createLanguageService(),
        onUnhandledError: jest.fn(),
    };

    const billingAddress = {
        id: '55c96cda6f04c',
        firstName: 'Test',
        lastName: 'Tester',
        email: 'test@bigcommerce.com',
        company: 'Bigcommerce',
        address1: '12345 Testing Way',
        address2: '',
        city: 'Some City',
        stateOrProvince: 'California',
        stateOrProvinceCode: 'CA',
        country: 'United States',
        countryCode: 'US',
        postalCode: '95555',
        shouldSaveAddress: true,
        phone: '555-555-5555',
        customFields: [],
    };

    beforeEach(() => {
        jest.spyOn(checkoutState.data, 'getBillingAddress').mockReturnValue(billingAddress);
        jest.spyOn(props.paymentForm, 'setFieldValue');

        localeContext = createLocaleContext(getStoreConfig());

        BraintreeTrustlyLocalPaymentMethodTest = (componentProps: PaymentMethodProps) => (
            <Formik initialValues={{}} onSubmit={noop}>
                <CheckoutContext.Provider value={{ checkoutState, checkoutService }}>
                    <PaymentFormContext.Provider value={{ paymentForm }}>
                        <LocaleContext.Provider value={localeContext}>
                            <BraintreeTrustlyLocalPaymentMethod {...componentProps} />
                        </LocaleContext.Provider>
                    </PaymentFormContext.Provider>
                </CheckoutContext.Provider>
            </Formik>
        );
    });

    it('successfully initializes payment with required props', () => {
        const initializePayment = jest
            .spyOn(checkoutService, 'initializePayment')
            .mockResolvedValue(checkoutState);

        render(<BraintreeTrustlyLocalPaymentMethodTest {...props} />);

        expect(initializePayment).toHaveBeenCalledWith({
            gatewayId: props.method.gateway,
            methodId: props.method.id,
            braintreelocalmethods: {
                container: '#checkout-payment-continue',
            },
        });
    });

    it('deinitializes BraintreeTrustlyLocalPaymentMethod', () => {
        const deinitializePayment = jest
            .spyOn(checkoutService, 'deinitializePayment')
            .mockResolvedValue(checkoutState);

        const { unmount } = render(<BraintreeTrustlyLocalPaymentMethodTest {...props} />);

        unmount();

        expect(deinitializePayment).toHaveBeenCalledWith({
            gatewayId: props.method.gateway,
            methodId: props.method.id,
        });
    });

    it('set the phone number of the billing address as the default value', () => {
        render(<BraintreeTrustlyLocalPaymentMethodTest {...props} />);

        expect(paymentForm.setFieldValue).toHaveBeenCalledWith('phoneNumber', billingAddress.phone);
    });
});
