import {
    CheckoutService,
    createCheckoutService,
    PaymentInitializeOptions,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';
import { act } from 'react-dom/test-utils';

import { CheckoutProvider } from '../../checkout';
import { getPaymentMethod } from '../payment-methods.mock';
import PaymentContext, { PaymentContextProps } from '../PaymentContext';

import HostedWidgetPaymentMethod from './HostedWidgetPaymentMethod';
import SquareV2PaymentMethod, { SquareV2PaymentMethodProps } from './SquareV2PaymentMethod';

describe('when using SquareV2PaymentMethod', () => {
    let checkoutService: CheckoutService;
    let paymentContext: PaymentContextProps;
    let method: PaymentMethod;
    let squareProps: SquareV2PaymentMethodProps;
    let SquareV2PaymentMethodTest: FunctionComponent;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        paymentContext = {
            disableSubmit: jest.fn(),
            setSubmit: jest.fn(),
            setValidationSchema: jest.fn(),
            hidePaymentSubmitButton: jest.fn(),
        };

        method = {
            ...getPaymentMethod(),
            id: 'squarev2',
        };
        squareProps = {
            method,
            deinitializePayment: jest.fn(),
            initializePayment: jest.fn(),
        };

        const dummyElement = document.createElement('div');

        dummyElement.style.backgroundColor = 'rgb(1, 1, 1)';
        dummyElement.style.borderColor = 'rgb(2, 2, 2)';
        dummyElement.style.borderRadius = '3px';
        dummyElement.style.borderWidth = '4px';
        dummyElement.style.color = 'rgb(5, 5, 5)';
        dummyElement.style.fontSize = '6px';
        dummyElement.style.fontWeight = 'normal';

        jest.spyOn(document, 'querySelector').mockReturnValue(dummyElement);

        SquareV2PaymentMethodTest = () => (
            <CheckoutProvider checkoutService={checkoutService}>
                <PaymentContext.Provider value={paymentContext}>
                    <Formik initialValues={{}} onSubmit={noop}>
                        <SquareV2PaymentMethod {...squareProps} />
                    </Formik>
                </PaymentContext.Provider>
            </CheckoutProvider>
        );
    });

    it('should render dummy form fields', () => {
        const dummyForm = mount(<SquareV2PaymentMethodTest />).find(
          '[data-test="squarev2_dummy_form"]',
        );

        expect(dummyForm).toMatchSnapshot();
    });

    it('renders as HostedWidgetPaymentMethod', () => {
        const hostedWidgetProps = mount(<SquareV2PaymentMethodTest />)
          .find(HostedWidgetPaymentMethod)
          .props();

        expect(hostedWidgetProps).toEqual(
          expect.objectContaining({
            containerId: 'squarev2_payment_element_container',
            initializePayment: expect.any(Function),
            method,
          }),
        );
    });

    it('initializes method with required config', async () => {
        const { id: methodId, gateway: gatewayId } = method;
        const initializePayment = mount(<SquareV2PaymentMethodTest />)
          .find(HostedWidgetPaymentMethod)
          .prop('initializePayment');

        await initializePayment({
            methodId,
            gatewayId,
        });

        expect(squareProps.initializePayment).toHaveBeenCalledWith(
            expect.objectContaining({
                methodId: 'squarev2',
                squarev2: {
                    containerId: 'squarev2_payment_element_container',
                    style: {
                        input: {
                            backgroundColor: 'rgb(1, 1, 1)',
                            color: 'rgb(5, 5, 5)',
                            fontSize: '6px',
                            fontWeight: 'normal'
                        },
                        'input.is-focus': {
                            backgroundColor: 'rgb(1, 1, 1)',
                            color: 'rgb(5, 5, 5)',
                            fontSize: '6px',
                            fontWeight: 'normal'
                        },
                        'input.is-error': { color: 'rgb(5, 5, 5)' },
                        '.input-container': {
                            borderColor: 'rgb(2, 2, 2)',
                            borderRadius: '3px',
                            borderWidth: '4px'
                        },
                        '.input-container.is-focus': { borderColor: 'rgb(2, 2, 2)', borderWidth: '4px' },
                        '.input-container.is-error': { borderColor: 'rgb(2, 2, 2)', borderWidth: '4px' },
                        '.message-text': { color: 'rgb(5, 5, 5)' },
                        '.message-icon': { color: 'rgb(5, 5, 5)' },
                        '.message-text.is-error': { color: 'rgb(5, 5, 5)' },
                        '.message-icon.is-error': { color: 'rgb(5, 5, 5)' }
                    },
                    onValidationChange: expect.any(Function),
                },
            }),
        );
    });
        
    it('should enable submit button', async () => {
        const { id: methodId, gateway: gatewayId } = method;
        const initializePayment = mount(<SquareV2PaymentMethodTest />)
          .find(HostedWidgetPaymentMethod)
          .prop('initializePayment');

        await initializePayment({
            methodId,
            gatewayId,
        });

        const {
          squarev2: { onValidationChange },
        } = (squareProps.initializePayment as jest.Mock).mock
          .calls[0][0] as PaymentInitializeOptions['squarev2'];

        act(() => {
            onValidationChange(true);
        });

        expect(paymentContext.disableSubmit).toHaveBeenNthCalledWith(1, method, true);
        expect(paymentContext.disableSubmit).toHaveBeenNthCalledWith(2, method, false);
    });
});
