import { createCheckoutService, LanguageService } from '@bigcommerce/checkout-sdk';
import { render } from '@testing-library/react';
import { EventEmitter } from 'events';
import React from 'react';

import { PaymentFormService } from '@bigcommerce/checkout/payment-integration-api';
import { PaypalCommerceRatePayPaymentMethod } from './index';
import { getPaypalCommerceRatePayMethodMock } from './mocks/paypalCommerceRatePayMocks';

describe('PaypalCommerceRatePayPaymentMethod', () => {
    let eventEmitter: EventEmitter;

    const checkoutService = createCheckoutService();
    const checkoutState = checkoutService.getState();
    const props = {
        checkoutService,
        checkoutState,
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        language: { translate: jest.fn() } as unknown as LanguageService,
        method: getPaypalCommerceRatePayMethodMock(),
        onUnhandledError: jest.fn(),
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        paymentForm: jest.fn() as unknown as PaymentFormService,
    };

    beforeEach(() => {
        eventEmitter = new EventEmitter();
    });

    it('initializes PaypalCommerceRatePayPaymentMethod with required props', () => {
        const initializePayment = jest
            .spyOn(checkoutService, 'initializePayment')
            .mockResolvedValue(checkoutState);

        render(<PaypalCommerceRatePayPaymentMethod {...props} />);

        expect(initializePayment).toHaveBeenCalledWith({
            gatewayId: props.method.gateway,
            methodId: props.method.id,
            paypalcommerceratepay: {
                container: '#checkout-payment-continue',
                legalTextContainer: 'legal-text-container',
                onError: expect.any(Function),
                getFieldsValues: expect.any(Function),
            },
        });
    });

    it('deinitializes PaypalCommerceRatePayPaymentMethod with required props', () => {
        const deinitializePayment = jest
            .spyOn(checkoutService, 'deinitializePayment')
            .mockResolvedValue(checkoutState);
        const component = render(<PaypalCommerceRatePayPaymentMethod {...props} />);

        component.unmount();

        expect(deinitializePayment).toHaveBeenCalledWith({
            gatewayId: props.method.gateway,
            methodId: props.method.id,
        });
    });
});
