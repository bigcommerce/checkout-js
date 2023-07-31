import { render } from 'enzyme';
import React from 'react';

import { getCart, getConsignment } from '@bigcommerce/checkout/test-utils';

import PayPalAxoStaticConsignment from './PayPalAxoStaticConsignment';
import * as usePayPalConnectAddress from './usePayPalConnectAddress';

describe('PayPal AXO StaticConsignment Component', () => {
    const consignment = getConsignment();
    const cart = getCart();

    beforeEach(() => {
        jest.spyOn(usePayPalConnectAddress, 'default').mockImplementation(
            jest.fn().mockImplementation(() => ({
                isPayPalConnectAddress: () => false,
            }))
        );
    });

    it('renders static consignment with shipping method', () => {
        const tree = render(<PayPalAxoStaticConsignment cart={cart} consignment={consignment} />);

        expect(tree).toMatchSnapshot();
    });

    it('renders compact view of static consignment', () => {
        const tree = render(
            <PayPalAxoStaticConsignment cart={cart} compactView consignment={consignment} />,
        );

        expect(tree).toMatchSnapshot();
    });

    it('renders PayPal Connect icon', () => {
        jest.spyOn(usePayPalConnectAddress, 'default').mockImplementation(
            jest.fn().mockImplementation(() => ({
                isPayPalConnectAddress: () => true,
            }))
        );

        const tree = render(<PayPalAxoStaticConsignment cart={cart} consignment={consignment} />);

        expect(tree).toMatchSnapshot();
    });
});
