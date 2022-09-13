import { createCheckoutService, LanguageService } from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import React from 'react';

import { PaymentFormService } from '@bigcommerce/checkout/payment-integration-api';

import ApplePaymentMethod from './ApplePayPaymentMethod';
import { getMethod } from './paymentMethods.mock';

describe('ApplePay payment method', () => {
    const checkoutService = createCheckoutService();
    const checkoutState = checkoutService.getState();
    const props = {
        method: getMethod(),
        checkoutService,
        checkoutState,
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        paymentForm: jest.fn() as unknown as PaymentFormService,
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        language: { translate: jest.fn() } as unknown as LanguageService,
        onUnhandledError: jest.fn(),
    };

    it('initializes ApplePay with required props', () => {
        const initializePayment = jest
            .spyOn(checkoutService, 'initializePayment')
            .mockResolvedValue(checkoutState);
        const component = mount(<ApplePaymentMethod {...props} />);

        expect(component.find(ApplePaymentMethod)).toHaveLength(1);
        expect(initializePayment).toHaveBeenCalled();
    });

    it('deinitializes ApplePay with required props', () => {
        const deinitializePayment = jest
            .spyOn(checkoutService, 'deinitializePayment')
            .mockResolvedValue(checkoutState);
        const component = mount(<ApplePaymentMethod {...props} />);

        component.unmount();

        expect(component.find(ApplePaymentMethod)).toHaveLength(0);
        expect(deinitializePayment).toHaveBeenCalled();
    });

    it('catches error during ApplePay initialization', async () => {
        jest.spyOn(checkoutService, 'initializePayment').mockRejectedValue(new Error('test error'));
        mount(<ApplePaymentMethod {...props} />);

        await new Promise((resolve) => process.nextTick(resolve));

        expect(props.onUnhandledError).toHaveBeenCalled();
    });

    it('catches error during ApplePay deinitialization', async () => {
        jest.spyOn(checkoutService, 'deinitializePayment').mockRejectedValue(
            new Error('test error'),
        );

        const component = mount(<ApplePaymentMethod {...props} />);

        await new Promise((resolve) => process.nextTick(resolve));

        component.unmount();

        await new Promise((resolve) => process.nextTick(resolve));

        expect(props.onUnhandledError).toHaveBeenCalled();
    });
});
