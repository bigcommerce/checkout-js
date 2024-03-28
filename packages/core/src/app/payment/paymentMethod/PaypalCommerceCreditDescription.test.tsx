import { CheckoutService, createCheckoutService, PaymentMethod } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent } from 'react';

import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';
import { render } from '@bigcommerce/checkout/test-utils';

import PaypalCommerceCreditDescription from './PaypalCommerceCreditDescription';

import { PaymentMethodId } from './index';

describe('PaypalCommerceCreditDescription', () => {
    let PaymentMethodDescriptionTest: FunctionComponent<{ method: PaymentMethod }>;
    let checkoutService: CheckoutService;
    let method: PaymentMethod;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        method = {
            id: 'paypalcommercecredit',
            logoUrl: '',
            method: 'paypal',
            supportedCards: [],
            config: {
                testMode: false,
            },
            type: 'PAYMENT_TYPE_API',
            clientToken: 'foo',
        }

        jest.spyOn(checkoutService, 'initializePayment').mockReturnValue(Promise.resolve(checkoutService.getState()));
        jest.spyOn(checkoutService, 'deinitializePayment').mockReturnValue(Promise.resolve(checkoutService.getState()))

        PaymentMethodDescriptionTest = (props) => (
            <CheckoutProvider checkoutService={checkoutService}>
                <PaypalCommerceCreditDescription
                    {...props}
                />
            </CheckoutProvider>
        );
    });

    it('initialization of the paypalcommercecredit method was successful', async () => {
        render(<PaymentMethodDescriptionTest method={method} />);

        expect(checkoutService.initializePayment).toHaveBeenCalledWith({
            methodId: PaymentMethodId.PaypalCommerceCredit,
            paypalcommercecredit: {
                bannerContainerId: 'paypal-commerce-banner-container',
            },
        });

        expect(checkoutService.deinitializePayment).toHaveBeenCalled();
    })

    it('deinitialization of the paypalcommercecredit method was successful', async () => {
        render(<PaymentMethodDescriptionTest method={method} />);

        expect(checkoutService.initializePayment).toHaveBeenCalled();

        expect(checkoutService.deinitializePayment).toHaveBeenCalledWith({
            methodId: PaymentMethodId.PaypalCommerceCredit,
        });
    })
})
