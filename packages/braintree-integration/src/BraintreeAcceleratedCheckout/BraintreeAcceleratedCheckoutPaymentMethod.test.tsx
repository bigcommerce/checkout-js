import { createCheckoutService, createLanguageService } from '@bigcommerce/checkout-sdk';
import React from 'react';

import { getPaymentFormServiceMock } from '@bigcommerce/checkout/test-mocks';
import { render } from '@bigcommerce/checkout/test-utils';

import BraintreeAcceleratedCheckoutPaymentMethod from './BraintreeAcceleratedCheckoutPaymentMethod';

describe('BraintreeAcceleratedCheckoutPaymentMethod', () => {
    const checkoutService = createCheckoutService();
    const checkoutState = checkoutService.getState();

    const method = {
        clientToken: 'token',
        config: {
            displayName: 'Credit Card',
            testMode: true,
        },
        id: 'braintreeacceleratedcheckout',
        initializationData: {
            isAcceleratedCheckoutEnabled: true,
        },
        logoUrl: 'http://logo_url_path',
        method: 'credit-card',
        supportedCards: ['VISA', 'MC'],
        type: 'PAYMENT_TYPE_API',
    };

    const props = {
        method,
        checkoutService,
        checkoutState,
        paymentForm: getPaymentFormServiceMock(),
        language: createLanguageService(),
        onUnhandledError: jest.fn(),
    };

    it('initializes BraintreeAcceleratedCheckoutPaymentMethod with required props', () => {
        const initializePayment = jest
            .spyOn(checkoutService, 'initializePayment')
            .mockResolvedValue(checkoutState);

        render(<BraintreeAcceleratedCheckoutPaymentMethod {...props} />);

        expect(initializePayment).toHaveBeenCalledWith({
            methodId: props.method.id,
            braintreefastlane: {
                onInit: expect.any(Function),
            },
        });
    });

    it('deinitializes BraintreeLocalMethod with required props', () => {
        const deinitializePayment = jest
            .spyOn(checkoutService, 'deinitializePayment')
            .mockResolvedValue(checkoutState);

        const view = render(<BraintreeAcceleratedCheckoutPaymentMethod {...props} />);

        view.unmount();

        expect(deinitializePayment).toHaveBeenCalledWith({
            methodId: props.method.id,
        });
    });
});
