import { CheckoutService, createCheckoutService, PaymentMethod } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent } from 'react';

import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';
import { render } from '@bigcommerce/checkout/test-utils';

import BraintreePaypalCreditDescription from './BraintreePaypalCreditDescription';

import { PaymentMethodId } from './index';

describe('BraintreePaypalCreditDescription', () => {
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
                <BraintreePaypalCreditDescription
                    {...props}
                />
            </CheckoutProvider>
        );
    });

    it('initialization of the braintreepaypalcredit method was successfu', async () => {
        render(<PaymentMethodDescriptionTest method={method} />);

        expect(checkoutService.initializePayment).toHaveBeenCalledWith({
            methodId: PaymentMethodId.BraintreePaypalCredit,
            braintree: {
                bannerContainerId: 'braintree-banner-container',
            },
        });

        expect(checkoutService.deinitializePayment).toHaveBeenCalled();
    })

    it('deinitialization of the braintreepaypalcredit method was successful', async () => {
        render(<PaymentMethodDescriptionTest method={method} />);

        expect(checkoutService.initializePayment).toHaveBeenCalled();

        expect(checkoutService.deinitializePayment).toHaveBeenCalledWith({
            methodId: PaymentMethodId.BraintreePaypalCredit,
        });
    })
})
