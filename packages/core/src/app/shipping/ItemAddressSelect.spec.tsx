import { shallow } from 'enzyme';
import React from 'react';

import { AddressSelect } from '../address';
import { getPhysicalItem } from '../cart/lineItem.mock';
import { getCustomer } from '../customer/customers.mock';

import { getConsignment } from './consignment.mock';
import ItemAddressSelect, { ItemAddressSelectProps } from './ItemAddressSelect';

describe('ItemAddressSelect Component', () => {
    const defaultProps: ItemAddressSelectProps = {
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
        const component = shallow(<ItemAddressSelect {...defaultProps} />);

        expect(component.find('[data-test="consigment-item-product-options"]')).toHaveLength(1);
    });

    it('renders address select with expected props', () => {
        const component = shallow(<ItemAddressSelect {...defaultProps} />);

        expect(component.find(AddressSelect).prop('addresses')).toEqual(getCustomer().addresses);

        expect(component.find(AddressSelect).prop('selectedAddress')).toEqual(
            getConsignment().shippingAddress,
        );
    });
});
