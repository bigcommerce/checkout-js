import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';

import Popover from './Popover';

describe('Popover Component', () => {
    it('renders with whatever child is passed', () => {
        const tree = shallow(
            <Popover>
                {/* eslint-disable-next-line */}
                <h1 />
            </Popover>,
        );

        expect(toJson(tree)).toMatchSnapshot();
    });
});
