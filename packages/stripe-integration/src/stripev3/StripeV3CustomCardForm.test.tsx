import { createCheckoutService } from '@bigcommerce/checkout-sdk';
import React, { type FunctionComponent } from 'react';

import { LocaleProvider } from '@bigcommerce/checkout/locale';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import StripeV3CustomCardForm, { type StripeV3CustomCardFormProps } from './StripeV3CustomCardForm';

describe('StripeV3CustomCardForm', () => {
    let defaultProps: StripeV3CustomCardFormProps;
    let StripeV3CustomCardFormTest: FunctionComponent<StripeV3CustomCardFormProps>;

    beforeEach(() => {
        defaultProps = {
            options: {
                cardNumberElementOptions: {
                    containerId: 'stripe-card-number-component-field',
                },
                cardExpiryElementOptions: {
                    containerId: 'stripe-expiry-component-field',
                },
                cardCvcElementOptions: {
                    containerId: 'stripe-cvc-component-field',
                },
            },
        };

        const checkoutService = createCheckoutService();

        StripeV3CustomCardFormTest = (props) => (
            <LocaleProvider checkoutService={checkoutService}>
                <StripeV3CustomCardForm {...props} />
            </LocaleProvider>
        );
    });

    it('renders stripeV3 card fields', () => {
        render(<StripeV3CustomCardFormTest {...defaultProps} />);

        expect(screen.getByText('Credit Card Number')).toBeInTheDocument();
        expect(screen.getByText('Expiration')).toBeInTheDocument();
        expect(screen.getByText('CVV')).toBeInTheDocument();
    });
});
