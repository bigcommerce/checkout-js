import { shallow } from 'enzyme';
import React from 'react';

import { getConsignment, getCustomer, getPhysicalItem } from '@bigcommerce/checkout/test-utils';

import { PayPalAxoAddressSelect } from '../../address/PayPalAxo';

import PayPalAxoItemAddressSelect, { PayPalAxoItemAddressSelectProps } from './PayPalAxoItemAddressSelect';

describe('PayPalAxoItemAddressSelect Component', () => {
    const defaultProps: PayPalAxoItemAddressSelectProps = {
        item: {
            ...getPhysicalItem(),
            consignment: getConsignment(),
            key: 'x',
        },
        addresses: getCustomer().addresses,
        onSelectAddress: jest.fn(),
        onUseNewAddress: jest.fn(),
    };

    it('renders product options', () => {
        const component = shallow(<PayPalAxoItemAddressSelect {...defaultProps} />);

        expect(component.find('[data-test="consigment-item-product-options"]')).toHaveLength(1);
    });

    it('renders address select with expected props', () => {
        const component = shallow(<PayPalAxoItemAddressSelect {...defaultProps} />);

        expect(component.find(PayPalAxoAddressSelect).prop('addresses')).toEqual(getCustomer().addresses);

        expect(component.find(PayPalAxoAddressSelect).prop('selectedAddress')).toEqual(
            getConsignment().shippingAddress,
        );
    });
});
