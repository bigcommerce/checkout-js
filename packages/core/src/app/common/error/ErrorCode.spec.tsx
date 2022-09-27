import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import React from 'react';

import ErrorCode from './ErrorCode';

describe('ErrorCode Component', () => {
    it('renders error code component with provided code', () => {
        const tree = shallow(<ErrorCode code="foo" />);

        expect(toJson(tree)).toMatchSnapshot();
    });
});
