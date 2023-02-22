import { shallow } from 'enzyme';
import React from 'react';

import Select from './Select';

describe('Select', () => {
    const options = [
        { item: 'Foo', value: 'foo' },
        { item: 'Bar', value: 'bar' },
        { item: 'Baz', value: 'baz' },
    ];

    it('matches snapshot', () => {
        expect(shallow(<Select name="foobar" options={options} />)).toMatchSnapshot();
    });

    it('renders component with test ID', () => {
        expect(
            shallow(<Select name="foobar" options={options} testId="test" />).prop('data-test'),
        ).toBe('test');
    });

    it('listens to DOM events', () => {
        const handleChange = jest.fn();
        const component = shallow(
            <Select name="foobar" onChange={handleChange} options={options} />,
        );

        component.simulate('change');

        expect(handleChange).toHaveBeenCalled();
    });
});
