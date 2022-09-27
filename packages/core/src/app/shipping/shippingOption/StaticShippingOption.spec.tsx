import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';

import { getShippingOption } from './shippingMethod.mock';
import StaticShippingOption from './StaticShippingOption';

describe('StaticShippingOption Component', () => {
    const method = getShippingOption();

    it('renders static shipping option with optional information', () => {
        const tree = shallow(<StaticShippingOption method={method} />);

        expect(toJson(tree)).toMatchSnapshot();
    });

    it('renders static shipping option with minimum information', () => {
        const tree = shallow(
            <StaticShippingOption
                method={{
                    ...method,
                    imageUrl: '',
                    transitTime: '',
                }}
            />,
        );

        expect(toJson(tree)).toMatchSnapshot();
    });
});
