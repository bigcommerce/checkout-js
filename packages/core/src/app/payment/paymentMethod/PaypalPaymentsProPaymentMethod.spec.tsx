import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { LocaleProvider } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';

import { getCheckout, getCheckoutPayment } from '../../checkout/checkouts.mock';
import { getStoreConfig } from '../../config/config.mock';
import { getPaymentMethod } from '../payment-methods.mock';

import HostedCreditCardPaymentMethod from './HostedCreditCardPaymentMethod';
import HostedPaymentMethod from './HostedPaymentMethod';
import { default as PaymentMethodComponent, PaymentMethodProps } from './PaymentMethod';
import PaymentMethodId from './PaymentMethodId';

describe('when using Paypal Payments Pro payment method', () => {
    let method: PaymentMethod;
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: PaymentMethodProps;
    let PaymentMethodTest: FunctionComponent<PaymentMethodProps>;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        method = {
            ...getPaymentMethod(),
            id: PaymentMethodId.PaypalPaymentsPro,
        };
        defaultProps = {
            method,
        };

        jest.spyOn(checkoutState.data, 'getConfig').mockReturnValue(getStoreConfig());

        jest.spyOn(checkoutService, 'deinitializePayment').mockResolvedValue(checkoutState);

        jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(checkoutState);

        PaymentMethodTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleProvider checkoutService={checkoutService}>
                    <Formik initialValues={{}} onSubmit={noop}>
                        <PaymentMethodComponent {...props} />
                    </Formik>
                </LocaleProvider>
            </CheckoutProvider>
        );
    });

    it('renders as credit card method', () => {
        const container = mount(<PaymentMethodTest {...defaultProps} />);

        expect(container.find(HostedCreditCardPaymentMethod).props()).toEqual(
            expect.objectContaining(defaultProps),
        );
    });

    it('renders as hosted payment method if shopper has already provided payment details via PayPal', () => {
        jest.spyOn(checkoutState.data, 'getCheckout').mockReturnValue({
            ...getCheckout(),
            payments: [
                {
                    ...getCheckoutPayment(),
                    providerId: 'paypal',
                },
            ],
        });

        const container = mount(<PaymentMethodTest {...defaultProps} />);

        expect(container.find(HostedPaymentMethod).props()).toEqual(
            expect.objectContaining(defaultProps),
        );
    });
});
