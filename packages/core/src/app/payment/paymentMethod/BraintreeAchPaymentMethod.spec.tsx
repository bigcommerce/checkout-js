import { PaymentMethod } from '@bigcommerce/checkout-sdk';
import { mount, ReactWrapper } from 'enzyme';
import React, { FunctionComponent } from 'react';

import { getBraintreeAchPaymentMethod } from '../payment-methods.mock';

import BraintreeAchPaymentMethod, { BraintreeAchPaymentMethodProps } from './BraintreeAchPaymentMethod';

describe('BraintreeAchPaymentMethod', () => {
    let BraintreeAchPaymentMethodTest: FunctionComponent<BraintreeAchPaymentMethodProps>;
    let defaultProps: BraintreeAchPaymentMethodProps;
    let method: PaymentMethod;

    beforeEach(() => {
        method = getBraintreeAchPaymentMethod();

        defaultProps = {
            initializePayment: jest.fn(),
            method
        }

        BraintreeAchPaymentMethodTest = (props) => (<BraintreeAchPaymentMethod {...props} />)
    })

    it('renders as braintree ach payment method', async () => {
        const container = mount(<BraintreeAchPaymentMethodTest {...defaultProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(container.find(BraintreeAchPaymentMethod).props()).toEqual(
            expect.objectContaining({
                method: defaultProps.method,
                initializePayment: defaultProps.initializePayment
            })
        )
    });

    it('initializes method with required config', () => {
        const container = mount(<BraintreeAchPaymentMethodTest {...defaultProps} />);

        const component: ReactWrapper<BraintreeAchPaymentMethodProps> =
            container.find(BraintreeAchPaymentMethod);

        component.prop('initializePayment')({
            methodId: method.id,
            gatewayId: method.gateway,
        });

        expect(defaultProps.initializePayment).toHaveBeenCalledWith(
            expect.objectContaining({
                methodId: 'braintreeach'
            })
        );
    });
})
