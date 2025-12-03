import { type CheckoutService, createCheckoutService } from '@bigcommerce/checkout-sdk';
import React from 'react';

import { CheckoutProvider } from '@bigcommerce/checkout/contexts';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getCheckout } from '../checkout/checkouts.mock';
import { getStoreConfig } from '../config/config.mock';

import PaymentRedeemables from './PaymentRedeemables';

describe('PaymentRedeemables', () => {
    let checkoutService: CheckoutService;

    beforeEach(() => {
        checkoutService = createCheckoutService();

        jest.spyOn(checkoutService.getState().data, 'getConfig').mockReturnValue(getStoreConfig());
        jest.spyOn(checkoutService.getState().data, 'getCheckout').mockReturnValue(getCheckout());
    });

    it('renders redeemable component', () => {
        render(
            <CheckoutProvider checkoutService={checkoutService}>
                <PaymentRedeemables />
            </CheckoutProvider>,
        );

        const link = screen.getByRole('link', { name: 'Coupon / gift certificate' });

        expect(screen.getByRole('group')).toBeInTheDocument();
        expect(screen.getByRole('group')).toHaveClass("form-fieldset redeemable-payments");
        expect(link).toHaveAttribute("aria-controls", "redeemable-collapsable");
        expect(link).toHaveAttribute("aria-expanded", "false");
        expect(link).toHaveAttribute("href", "#");
        expect(link).toHaveAttribute("data-test", "redeemable-label");
        expect(link).toHaveClass("redeemable-label");
    });
});
