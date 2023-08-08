import { render, screen } from '@testing-library/react';
import React from 'react';

import { getCart, getConsignment } from '@bigcommerce/checkout/test-utils';

import * as usePayPalConnectAddress from '../../address/PayPalAxo/usePayPalConnectAddress';

import PayPalAxoStaticConsignment from './PayPalAxoStaticConsignment';

jest.mock('../../address/StaticAddress', () => () => <div>StaticAddress</div>);
jest.mock('../shippingOption', () => ({
    StaticShippingOption: () => <div>StaticShippingOption</div>,
}));
jest.mock('../../address/PayPalAxo/PoweredByPaypalConnectLabel', () => () => <div>PoweredByPaypalConnectLabel</div>);
jest.mock('../StaticConsignmentItemList', () => () => <div>StaticConsignmentItemList</div>);

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
        render(<PayPalAxoStaticConsignment cart={cart} consignment={consignment} />);

        expect(screen.getByText('StaticConsignmentItemList')).toBeInTheDocument();
    });

    it('renders compact view of static consignment', () => {
        render(
            <PayPalAxoStaticConsignment cart={cart} compactView consignment={consignment} />,
        );

        expect(screen.queryByText('StaticConsignmentItemList')).not.toBeInTheDocument();
    });

    it('renders PayPal Connect icon', () => {
        jest.spyOn(usePayPalConnectAddress, 'default').mockImplementation(
            jest.fn().mockImplementation(() => ({
                isPayPalConnectAddress: () => true,
            }))
        );

        render(<PayPalAxoStaticConsignment cart={cart} consignment={consignment} />);

        expect(screen.getByText('PoweredByPaypalConnectLabel')).toBeInTheDocument();
    });
});
