import { CheckoutService, createCheckoutService } from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import React from 'react';

import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';

import { Redeemable } from '../cart';
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

    it('renders redeemable component with container fieldset', () => {
        const container = mount(
            <CheckoutProvider checkoutService={checkoutService}>
                <PaymentRedeemables />
            </CheckoutProvider>,
        );

        expect(container.exists('fieldset.redeemable-payments')).toBe(true);
    });

    it('renders redeemable component with applied redeemables', () => {
        const container = mount(
            <CheckoutProvider checkoutService={checkoutService}>
                <PaymentRedeemables />
            </CheckoutProvider>,
        );

        expect(container.find(Redeemable).prop('showAppliedRedeemables')).toBe(true);
    });
});
