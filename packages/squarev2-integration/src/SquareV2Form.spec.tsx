import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import { render } from '@testing-library/react';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import {
    CheckoutProvider,
    PaymentFormContext,
    PaymentFormService,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    getCustomer,
    getInstruments,
    getPaymentFormServiceMock,
} from '@bigcommerce/checkout/test-utils';

import { getSquareV2 } from './mocks/squarev2-method.mock';
import SquareV2Form, { SquareV2FormProps } from './SquareV2Form';

describe('SquareV2 form', () => {
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let paymentForm: PaymentFormService;
    let props: SquareV2FormProps;
    let SquareV2FormTest: FunctionComponent;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        jest.spyOn(checkoutState.data, 'isPaymentDataRequired').mockReturnValue(true);
        paymentForm = getPaymentFormServiceMock();

        const containerId = 'squarev2_payment_element_container';

        props = {
            checkoutState,
            containerId,
            deinitializePayment: jest.fn(),
            initializePayment: jest.fn(),
            method: getSquareV2(),
            renderPlaceholderFields: jest.fn(),
        };

        const placeholderElement = document.createElement('div');

        placeholderElement.style.backgroundColor = 'rgb(1, 1, 1)';
        placeholderElement.style.borderColor = 'rgb(2, 2, 2)';
        placeholderElement.style.borderRadius = '3px';
        placeholderElement.style.borderWidth = '4px';
        placeholderElement.style.color = 'rgb(5, 5, 5)';
        placeholderElement.style.fontSize = '6px';
        placeholderElement.style.fontWeight = 'normal';

        jest.spyOn(document, 'querySelector').mockReturnValue(placeholderElement);
    });

    describe('when rendering', () => {
        beforeEach(() => {
            SquareV2FormTest = () => (
                <PaymentFormContext.Provider value={{ paymentForm }}>
                    <SquareV2Form {...props} />
                </PaymentFormContext.Provider>
            );
        });

        it('should match snapshot', () => {
            expect(render(<SquareV2FormTest />)).toMatchSnapshot();
        });

        it('should render a loading overlay', () => {
            jest.spyOn(checkoutState.statuses, 'isLoadingInstruments').mockReturnValue(true);

            const { container } = render(<SquareV2FormTest />);

            expect(container.getElementsByClassName('loadingOverlay')).toHaveLength(1);
        });

        it('should not render store instrument fieldset when storing cards is disabled', () => {
            const { container } = render(<SquareV2FormTest />);

            expect(container.getElementsByClassName('form-field--saveInstrument')).toHaveLength(0);
        });
    });

    describe('when stored credit cards is enabled', () => {
        beforeEach(() => {
            props = {
                ...props,
                method: {
                    ...getSquareV2(),
                    config: { ...getSquareV2().config, isVaultingEnabled: true },
                },
            };

            SquareV2FormTest = () => (
                <PaymentFormContext.Provider value={{ paymentForm }}>
                    <CheckoutProvider checkoutService={checkoutService}>
                        <Formik initialValues={{}} onSubmit={noop}>
                            <SquareV2Form {...props} />
                        </Formik>
                    </CheckoutProvider>
                </PaymentFormContext.Provider>
            );

            jest.spyOn(checkoutState.data, 'getCustomer').mockReturnValue(getCustomer());
            jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue(getInstruments());
        });

        it('should render store instrument fieldset', () => {
            const { container } = render(<SquareV2FormTest />);

            expect(container.getElementsByClassName('form-field--saveInstrument')).toHaveLength(1);
        });

        it('should not show instruments fieldset when there are no stored cards', () => {
            jest.spyOn(checkoutState.data, 'getInstruments').mockReturnValue([]);

            const { container } = render(<SquareV2FormTest />);

            expect(container.getElementsByClassName('instrumentFieldset')).toHaveLength(0);
        });

        it('should show instruments fieldset when there is at least one stored card', () => {
            const { container } = render(<SquareV2FormTest />);

            expect(container.getElementsByClassName('instrumentFieldset')).toHaveLength(1);
        });

        it('should hide payment form when vaulted instrument is selected', () => {
            const formContainer = render(<SquareV2FormTest />).getByTestId(
                'squarev2_payment_element_container',
            );

            expect(formContainer.style.display).toBe('none');
        });
    });
});
