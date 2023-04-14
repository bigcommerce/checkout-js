import {
    CheckoutSelectors,
    CheckoutService,
    createCheckoutService,
} from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { createLocaleContext } from '@bigcommerce/checkout/locale';
import {
    PaymentFormService,
    PaymentMethodProps,
} from '@bigcommerce/checkout/payment-integration-api';
import {
    getBraintreeAchPaymentMethod,
    getPaymentFormServiceMock,
    getStoreConfig,
} from '@bigcommerce/checkout/test-utils';

import BraintreeAchPaymentMethod from './BraintreeAchPaymentMethod';

describe('BraintreeAchPaymentForm', () => {
    let checkoutService: CheckoutService;
    let checkoutState: CheckoutSelectors;
    let defaultProps: PaymentMethodProps;
    let BraintreeAchPaymentMethodTest: FunctionComponent<PaymentMethodProps>;
    let paymentForm: PaymentFormService;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        checkoutState = checkoutService.getState();
        paymentForm = getPaymentFormServiceMock();

        jest.spyOn(checkoutService, 'initializePayment').mockResolvedValue(checkoutState);

        jest.spyOn(checkoutService, 'deinitializePayment').mockResolvedValue(checkoutState);

        jest.spyOn(checkoutService, 'loadBillingAddressFields').mockResolvedValue(
            {} as CheckoutSelectors,
        );

        const { language } = createLocaleContext(getStoreConfig());

        defaultProps = {
            method: getBraintreeAchPaymentMethod(),
            checkoutService,
            checkoutState,
            paymentForm,
            language,
            onUnhandledError: jest.fn(),
        };

        BraintreeAchPaymentMethodTest = (props: PaymentMethodProps) => (
            <Formik initialValues={{}} onSubmit={noop}>
                <BraintreeAchPaymentMethod {...props} />
            </Formik>
        );
    });

    it('initializes payment method', async () => {
        const component = mount(<BraintreeAchPaymentMethodTest {...defaultProps} />);

        expect(component.find(BraintreeAchPaymentMethod)).toHaveLength(1);
        expect(checkoutService.loadBillingAddressFields).toHaveBeenCalled();

        await new Promise((resolve) => process.nextTick(resolve));

        expect(checkoutService.initializePayment).toHaveBeenCalledWith({
            braintreeach: {
                mandateText:
                    'I authorize Braintree to debit my bank account on behalf of My Online Store.',
            },
            gatewayId: undefined,
            methodId: 'braintreeach',
        });
    });

    it('catches an error during failed initialization of loadBillingAddressFields', async () => {
        jest.spyOn(checkoutService, 'initializePayment').mockRejectedValue(new Error('error'));
        mount(<BraintreeAchPaymentMethodTest {...defaultProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(defaultProps.onUnhandledError).toHaveBeenCalled();
    });

    it('catches an error during failed initialization of initializePayment', async () => {
        jest.spyOn(checkoutService, 'initializePayment').mockRejectedValue(new Error('error'));
        mount(<BraintreeAchPaymentMethodTest {...defaultProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(defaultProps.onUnhandledError).toHaveBeenCalled();
    });

    it('deinitializes payment method when component unmounts', () => {
        const component = mount(<BraintreeAchPaymentMethodTest {...defaultProps} />);

        mount(<BraintreeAchPaymentMethodTest {...defaultProps} />);

        expect(checkoutService.deinitializePayment).not.toHaveBeenCalled();

        component.unmount();

        expect(checkoutService.deinitializePayment).toHaveBeenCalled();
    });

    it('catches error during offline deinitialization', async () => {
        jest.spyOn(checkoutService, 'deinitializePayment').mockRejectedValue(
            new Error('test error'),
        );

        const component = mount(<BraintreeAchPaymentMethodTest {...defaultProps} />);

        await new Promise((resolve) => process.nextTick(resolve));

        component.unmount();

        await new Promise((resolve) => process.nextTick(resolve));

        expect(defaultProps.onUnhandledError).toHaveBeenCalled();
    });
});
