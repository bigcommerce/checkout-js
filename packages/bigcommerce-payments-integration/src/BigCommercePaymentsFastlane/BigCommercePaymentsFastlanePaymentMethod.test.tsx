import { createCheckoutService, createLanguageService } from '@bigcommerce/checkout-sdk';
import { createBigCommercePaymentsFastlanePaymentStrategy } from '@bigcommerce/checkout-sdk/integrations/bigcommerce-payments';
import React from 'react';

import { getPaymentFormServiceMock } from '@bigcommerce/checkout/test-mocks';
import { render } from '@bigcommerce/checkout/test-utils';

import BigCommercePaymentsFastlanePaymentMethod from './BigCommercePaymentsFastlanePaymentMethod';

describe('BigCommercePaymentsFastlanePaymentMethod', () => {
    const checkoutService = createCheckoutService();
    const checkoutState = checkoutService.getState();

    const method = {
        clientToken: 'token',
        config: {
            displayName: 'Credit Card',
            testMode: true,
        },
        id: 'bigcommerce_payments_fastlane',
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

    it('initializes BigCommercePaymentsFastlanePaymentMethod with required props', () => {
        const initializePayment = jest
            .spyOn(checkoutService, 'initializePayment')
            .mockResolvedValue(checkoutState);

        render(<BigCommercePaymentsFastlanePaymentMethod {...props} />);

        expect(initializePayment).toHaveBeenCalledWith({
            methodId: props.method.id,
            integrations: [createBigCommercePaymentsFastlanePaymentStrategy],
            bigcommerce_payments_fastlane: {
                onInit: expect.any(Function),
                onChange: expect.any(Function),
                onError: expect.any(Function),
            },
        });
    });

    it('deinitializes BigCommercePaymentsFastlanePaymentMethod with required props', () => {
        const deinitializePayment = jest
            .spyOn(checkoutService, 'deinitializePayment')
            .mockResolvedValue(checkoutState);

        const view = render(<BigCommercePaymentsFastlanePaymentMethod {...props} />);

        view.unmount();

        expect(deinitializePayment).toHaveBeenCalledWith({
            methodId: props.method.id,
        });
    });
});
