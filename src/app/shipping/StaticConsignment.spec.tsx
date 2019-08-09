import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';

import { getCart } from '../cart/carts.mock';

import { getConsignment } from './consignment.mock';
import StaticConsignment from './StaticConsignment';

describe('StaticConsignment Component', () => {
    const consignment = getConsignment();
    const cart = getCart();

    it('renders static consignment without shipping method', () => {
        const tree = shallow(
            <StaticConsignment cart={ cart } consignment={ consignment }/>);

        expect(toJson(tree)).toMatchSnapshot();
    });

    it('renders static consignment with shipping method', () => {
        const tree = shallow(
            <StaticConsignment cart={ cart } consignment={ consignment } showShippingMethod={ true }/>);

        expect(toJson(tree)).toMatchSnapshot();
    });

    it('renders compact view of static consignment', () => {
        const tree = shallow(
            <StaticConsignment cart={ cart } compactView={ true } consignment={ consignment } showShippingMethod={ true }/>);

        expect(toJson(tree)).toMatchSnapshot();
    });
});
