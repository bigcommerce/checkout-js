import { CheckoutSelectors, CheckoutService, createCheckoutService } from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { CheckoutProvider } from '../../checkout';
import { getStoreConfig } from '../../config/config.mock';
import { createLocaleContext, LocaleContext, LocaleContextType } from '../../locale';
import { getBraintreeAchPaymentMethod } from '../payment-methods.mock';
import PaymentContext, { PaymentContextProps } from '../PaymentContext';

import BraintreeAchPaymentForm, { BraintreeAchPaymentFormProps } from './BraintreeAchPaymentForm';
import PaymentMethodId from './PaymentMethodId';

describe('when using Braintree ACH payment', () => {
    let BraintreeAchPaymentFormTest: FunctionComponent<BraintreeAchPaymentFormProps>;
    let defaultProps: BraintreeAchPaymentFormProps;
    let localeContext: LocaleContextType;
    let paymentContext: PaymentContextProps;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;

    beforeEach(() => {
        defaultProps = {
            initializePayment: jest.fn(),
            method: {
                ...getBraintreeAchPaymentMethod(),
                id: PaymentMethodId.BraintreeAch
            },
            mandateText: '',
            isLoadingBillingCountries: false,
            initializeBillingAddressFields: jest.fn()
        };

        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        localeContext = createLocaleContext(getStoreConfig());

        paymentContext = {
            disableSubmit: jest.fn(),
            setSubmit: jest.fn(),
            setValidationSchema: jest.fn(),
            hidePaymentSubmitButton: jest.fn(),
        };

        jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(checkoutState);
        jest.spyOn(checkoutService, 'loadBillingAddressFields').mockResolvedValue(checkoutState);

        BraintreeAchPaymentFormTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <PaymentContext.Provider value={paymentContext}>
                    <LocaleContext.Provider value={localeContext}>
                        <Formik initialValues={{}} onSubmit={noop}>
                            <BraintreeAchPaymentForm { ...props }/>
                        </Formik>
                    </LocaleContext.Provider>
                </PaymentContext.Provider>
            </CheckoutProvider>
        );
    })

    it('renders as braintree ach payment method', async () => {
        const container = mount(<BraintreeAchPaymentFormTest { ...defaultProps } />);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(container.find(BraintreeAchPaymentForm).props()).toEqual(
            expect.objectContaining({
                method: defaultProps.method,
            }),
        )
    });
})
