import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
    createLanguageService,
    PaymentInitializeOptions,
    PaymentRequestOptions,
} from '@bigcommerce/checkout-sdk';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import {
    PaymentFormService,
    PaymentMethodProps,
} from '@bigcommerce/checkout/payment-integration-api';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import BlueSnapDirectIdealPaymentMethod from './BlueSnapDirectIdealPaymentMethod';
import { getBlueSnapDirect } from './mocks/bluesnapdirect-method.mock';

describe('BlueSnapDirectIdeal payment method', () => {
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
    let BlueSnapDirectIdealTest: FunctionComponent;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        initializePayment = jest
            .spyOn(checkoutService, 'initializePayment')
            .mockResolvedValue(checkoutState);
        deinitializePayment = jest
            .spyOn(checkoutService, 'deinitializePayment')
            .mockResolvedValue(checkoutState);
        checkoutState = checkoutService.getState();
        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(true);
        props = {
            method: getBlueSnapDirect('ideal'),
            checkoutService,
            checkoutState,
            paymentForm: {
                disableSubmit: jest.fn(),
                setValidationSchema: jest.fn(),
            } as unknown as PaymentFormService,
            language: createLanguageService(),
            onUnhandledError: jest.fn(),
        };
        initialValues = {
            iban: '',
            firstName: '',
            lastName: '',
            routingNumber: '',
        };
        BlueSnapDirectIdealTest = () => (
            <Formik initialValues={initialValues} onSubmit={noop}>
                <BlueSnapDirectIdealPaymentMethod {...props} />
            </Formik>
        );
    });

    it('should be initialized with the required config', () => {
        render(<BlueSnapDirectIdealTest />);

        expect(initializePayment).toHaveBeenCalledWith({
            gatewayId: 'bluesnapdirect',
            methodId: 'ideal',
        });
    });

    it('should show list of banks', () => {
        render(<BlueSnapDirectIdealTest />);

        expect(
            screen.getByLabelText(props.language.translate('payment.ideal.label')),
        ).toBeInTheDocument();

        expect(screen.getByText('Test Bank')).toBeInTheDocument();
        expect(screen.getByText('Test Bank1')).toBeInTheDocument();
    });

    it('should be deinitialized with the required config', () => {
        render(<BlueSnapDirectIdealTest />).unmount();

        expect(deinitializePayment).toHaveBeenCalledWith({
            gatewayId: 'bluesnapdirect',
            methodId: 'ideal',
        });
    });
});
