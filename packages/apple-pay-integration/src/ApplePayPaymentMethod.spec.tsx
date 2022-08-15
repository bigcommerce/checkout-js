import { PaymentFormService } from "@bigcommerce/checkout/payment-integration-api";
import { createCheckoutService, LanguageService } from "@bigcommerce/checkout-sdk";
import { mount } from 'enzyme';
import React from "react";

import ApplePaymentMethod from './ApplePayPaymentMethod';
import { getMethod } from './paymentMethods.mock';

describe('ApplePay payment method', () => {
    const checkoutService = createCheckoutService();
    const checkoutState = checkoutService.getState();
    const props = {
        method: getMethod(),
        checkoutService,
        checkoutState,
        paymentForm: jest.fn() as unknown as PaymentFormService,
        language: {translate: jest.fn() } as unknown as LanguageService,
        onUnhandledError: jest.fn(),
    };

    it('initializes ApplePay with required props', () => {
        const initializePayment = jest.spyOn(checkoutService,'initializePayment').mockResolvedValue(checkoutState);
        const component = mount(<ApplePaymentMethod {...props} />);

        expect(component.find(ApplePaymentMethod)).toHaveLength(1);
        expect(initializePayment).toHaveBeenCalled()
    });

    it('deinitializes ApplePay with required props', () => {
        const deinitializePayment = jest.spyOn(checkoutService,'deinitializePayment').mockResolvedValue(checkoutState);
        const component = mount(<ApplePaymentMethod {...props} />);
        component.unmount();

        expect(component.find(ApplePaymentMethod)).toHaveLength(0);
        expect(deinitializePayment).toHaveBeenCalled()
    });
});
