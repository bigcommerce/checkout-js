import { CheckoutService, createCheckoutService, PaymentMethod } from '@bigcommerce/checkout-sdk';
import { render, screen } from '@testing-library/react';
import React, { FunctionComponent } from 'react';

import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';

import PaymentMethodDescription from './PaymentMethodDescription';

describe('PaymentMethodDescription', () => {
    let PaymentMethodDescriptionTest: FunctionComponent<{ method: PaymentMethod }>;
    let checkoutService: CheckoutService;
    let method: PaymentMethod;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        method = {
            id: 'braintreepaypalcredit',
            logoUrl: '',
            method: 'paypal',
            supportedCards: [],
            config: {
                testMode: false,
            },
            type: 'PAYMENT_TYPE_API',
            clientToken: 'foo',
            initializationData: {
                isBraintreeVenmoEnabled: false,
            },
        }

        jest.spyOn(checkoutService, 'initializePayment').mockReturnValue(Promise.resolve(checkoutService.getState()));
        jest.spyOn(checkoutService, 'deinitializePayment').mockReturnValue(Promise.resolve(checkoutService.getState()))

        PaymentMethodDescriptionTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                    <PaymentMethodDescription
                        {...props}
                    />
            </CheckoutProvider>
        );
    });

    it('render BraintreePaypalCredit description', async () => {
        render(<PaymentMethodDescriptionTest method={method} />);

        expect(screen.getByTestId('braintree-banner-container')).not.toBeUndefined();
    })
})
