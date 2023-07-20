import { createCheckoutService, LanguageService } from '@bigcommerce/checkout-sdk';
import { render } from '@testing-library/react';
import React from 'react';

import { PaymentFormService } from '@bigcommerce/checkout/payment-integration-api';

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
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        paymentForm: jest.fn() as unknown as PaymentFormService,
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        language: { translate: jest.fn() } as unknown as LanguageService,
        onUnhandledError: jest.fn(),
    };

    it('initializes BraintreeAcceleratedCheckoutPaymentMethod with required props', () => {
        const initializePayment = jest
            .spyOn(checkoutService, 'initializePayment')
            .mockResolvedValue(checkoutState);

        render(<BraintreeAcceleratedCheckoutPaymentMethod {...props} />);

        expect(initializePayment).toHaveBeenCalledWith({
            methodId: props.method.id,
            braintreeacceleratedcheckout: {
                container: '#braintree-axo-cc-form-container',
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
