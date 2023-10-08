import { createCheckoutService } from '@bigcommerce/checkout-sdk';
import { render } from 'enzyme';
import React from 'react';

import { LocaleProvider } from '@bigcommerce/checkout/locale';
import { CheckoutProvider } from '@bigcommerce/checkout/payment-integration-api';

import { getCart } from '../cart/carts.mock';

import { getConsignment } from './consignment.mock';
import StaticConsignment from './StaticConsignment';

describe('StaticConsignment Component', () => {
    const consignment = getConsignment();
    const cart = getCart();
    const checkoutService = createCheckoutService();

    it('renders static consignment with shipping method', () => {
        const tree = render(
            <CheckoutProvider checkoutService={checkoutService}>
                <LocaleProvider checkoutService={checkoutService}>
                    <StaticConsignment cart={cart} consignment={consignment} />
                </LocaleProvider>
            </CheckoutProvider>
        );

        expect(tree).toMatchSnapshot();
    });

    it('renders compact view of static consignment', () => {
        const tree = render(
            <CheckoutProvider checkoutService={checkoutService}>
                <StaticConsignment cart={cart} compactView consignment={consignment} />
            </CheckoutProvider>
        );

        expect(tree).toMatchSnapshot();
    });
});
