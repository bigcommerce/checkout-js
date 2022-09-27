import { render } from 'enzyme';
import React from 'react';

import { getCart } from '../cart/carts.mock';

import { getConsignment } from './consignment.mock';
import StaticConsignment from './StaticConsignment';

describe('StaticConsignment Component', () => {
    const consignment = getConsignment();
    const cart = getCart();

    it('renders static consignment with shipping method', () => {
        const tree = render(<StaticConsignment cart={cart} consignment={consignment} />);

        expect(tree).toMatchSnapshot();
    });

    it('renders compact view of static consignment', () => {
        const tree = render(
            <StaticConsignment cart={cart} compactView consignment={consignment} />,
        );

        expect(tree).toMatchSnapshot();
    });
});
