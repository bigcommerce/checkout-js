import { shallow } from 'enzyme';
import React from 'react';

import Input from './Input';

describe('Input', () => {
    it('matches snapshot', () => {
        expect(shallow(<Input name="foobar" />)).toMatchSnapshot();
    });

    it('renders component with test ID', () => {
        expect(shallow(<Input name="foobar" testId="test" />).prop('data-test')).toBe('test');
    });

    it('listens to DOM events', () => {
        const handleChange = jest.fn();
        const component = shallow(<Input name="foobar" onChange={handleChange} />);

        component.simulate('change');

        expect(handleChange).toHaveBeenCalled();
    });
});
