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

import BlueSnapDirectSepaPaymentMethod from './BlueSnapDirectSepaPaymentMethod';
import { getBlueSnapDirect } from './mocks/bluesnapdirect-method.mock';

describe('BlueSnapDirectSepa payment method', () => {
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
    let BlueSnapDirectSepaTest: FunctionComponent;

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
            method: getBlueSnapDirect('sepa_direct_debit'),
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
        BlueSnapDirectSepaTest = () => (
            <Formik initialValues={initialValues} onSubmit={noop}>
                <BlueSnapDirectSepaPaymentMethod {...props} />
            </Formik>
        );
    });

    it('should be initialized with the required config', () => {
        render(<BlueSnapDirectSepaTest />);

        expect(initializePayment).toHaveBeenCalledWith({
            gatewayId: 'bluesnapdirect',
            methodId: 'sepa_direct_debit',
        });
    });

    it('should enable submit button if user grants permission', () => {
        const {
            paymentForm: { disableSubmit },
            method,
        } = props;

        render(<BlueSnapDirectSepaTest />);

        const permissionChangeCheckbox = screen.getByLabelText(
            props.language.translate('payment.bluesnap_direct_sepa_mandate_disclaimer', {
                creditorName: 'Sepa Creditor Company Name',
            }),
        );

        fireEvent.click(permissionChangeCheckbox);

        expect(disableSubmit).toHaveBeenCalledTimes(2);
        expect(disableSubmit).toHaveBeenNthCalledWith(1, method, true);
        expect(disableSubmit).toHaveBeenNthCalledWith(2, method, false);
    });

    it('should be deinitialized with the required config', () => {
        render(<BlueSnapDirectSepaTest />).unmount();

        expect(deinitializePayment).toHaveBeenCalledWith({
            gatewayId: 'bluesnapdirect',
            methodId: 'sepa_direct_debit',
        });
    });
});
