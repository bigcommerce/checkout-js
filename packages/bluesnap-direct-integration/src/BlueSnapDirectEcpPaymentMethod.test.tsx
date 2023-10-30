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
import { fireEvent, render, screen } from '@bigcommerce/checkout/test-utils';

import BlueSnapDirectEcpPaymentMethod from './BlueSnapDirectEcpPaymentMethod';
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
    let BlueSnapDirectEcpTest: FunctionComponent;

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
            method: getBlueSnapDirect('ecp'),
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
            accountNumber: '',
            routingNumber: '',
        };
        BlueSnapDirectEcpTest = () => (
            <Formik initialValues={initialValues} onSubmit={noop}>
                <BlueSnapDirectEcpPaymentMethod {...props} />
            </Formik>
        );
    });

    it('should be initialized with the required config', () => {
        render(<BlueSnapDirectEcpTest />);

        expect(initializePayment).toHaveBeenCalledWith({
            gatewayId: 'bluesnapdirect',
            methodId: 'ecp',
        });
    });

    it('should enable submit button if user grants permission', () => {
        const {
            paymentForm: { disableSubmit },
            method,
        } = props;

        render(<BlueSnapDirectEcpTest />);

        const permissionChangeCheckbox = screen.getByLabelText(
            props.language.translate('payment.bluesnap_direct_permission'),
        );

        fireEvent.click(permissionChangeCheckbox);

        expect(disableSubmit).toHaveBeenCalledTimes(2);
        expect(disableSubmit).toHaveBeenNthCalledWith(1, method, true);
        expect(disableSubmit).toHaveBeenNthCalledWith(2, method, false);
    });

    it('should be deinitialized with the required config', () => {
        render(<BlueSnapDirectEcpTest />).unmount();

        expect(deinitializePayment).toHaveBeenCalledWith({
            gatewayId: 'bluesnapdirect',
            methodId: 'ecp',
        });
    });
});
