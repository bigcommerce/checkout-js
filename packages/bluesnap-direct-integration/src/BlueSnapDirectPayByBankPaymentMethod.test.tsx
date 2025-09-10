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
import { getPaymentFormServiceMock } from '@bigcommerce/checkout/test-mocks';
import { render } from '@bigcommerce/checkout/test-utils';

import BlueSnapDirectPayByBankPaymentMethod from './BlueSnapDirectPayByBankPaymentMethod';
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
    let BlueSnapDirectPayByBankTest: FunctionComponent;
    let paymentForm: PaymentFormService;
    const method = getBlueSnapDirect('pay_by_bank');

    beforeEach(() => {
        checkoutService = createCheckoutService();
        paymentForm = getPaymentFormServiceMock();
        initializePayment = jest
            .spyOn(checkoutService, 'initializePayment')
            .mockResolvedValue(checkoutState);
        deinitializePayment = jest
            .spyOn(checkoutService, 'deinitializePayment')
            .mockResolvedValue(checkoutState);
        props = {
            method,
            checkoutService,
            checkoutState,
            paymentForm,
            language: createLanguageService(),
            onUnhandledError: jest.fn(),
        };
        initialValues = {
            iban: '',
        };
        BlueSnapDirectPayByBankTest = () => (
            <Formik initialValues={initialValues} onSubmit={noop}>
                <CheckoutContext.Provider value={{ checkoutState, checkoutService }}>
                    <PaymentFormContext.Provider value={{ paymentForm }}>
                        <BlueSnapDirectPayByBankPaymentMethod {...props} />
                    </PaymentFormContext.Provider>
                </CheckoutContext.Provider>
            </Formik>
        );
    });

    it('should be initialized with the required config', () => {
        render(<BlueSnapDirectPayByBankTest />);

        expect(initializePayment).toHaveBeenCalledWith({
            gatewayId: 'bluesnapdirect',
            methodId: 'pay_by_bank',
            integrations: [createBlueSnapDirectAPMPaymentStrategy],
        });
    });

    it('should be deinitialized with the required config', () => {
        render(<BlueSnapDirectPayByBankTest />).unmount();

        expect(deinitializePayment).toHaveBeenCalledWith({
            gatewayId: 'bluesnapdirect',
            methodId: 'pay_by_bank',
        });
    });
});
