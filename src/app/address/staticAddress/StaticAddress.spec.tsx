import { createCheckoutService, CheckoutService } from '@bigcommerce/checkout-sdk';
import { mount } from 'enzyme';
import React from 'react';

import { CheckoutProvider } from '../../checkout';
import { getCountries } from '../../geography/countries.mock';
import { getAddress } from '../address.mock';

import StaticAddress from './StaticAddress';

describe('StaticAddress Component', () => {
    const address = getAddress();
    let checkoutService: CheckoutService;

    beforeEach(() => {
        checkoutService = createCheckoutService();
        jest.spyOn(checkoutService.getState().data, 'getBillingCountries')
            .mockReturnValue(getCountries());
    });

    it('renders component with supplied props', () => {
        const tree = mount(
            <CheckoutProvider checkoutService={ checkoutService }>
                <StaticAddress address={ address } />
            </CheckoutProvider>
        );

        expect(tree.find(StaticAddress).getDOMNode()).toMatchSnapshot();
    });

    it('renders component when props are missing', () => {
        const tree = mount(
            <CheckoutProvider checkoutService={ checkoutService }>
                <StaticAddress
                    address={ {
                        ...address,
                        phone: '',
                        address2: '',
                    } }
                />
            </CheckoutProvider>
        );

        expect(tree.find(StaticAddress).getDOMNode()).toMatchSnapshot();
    });
});
