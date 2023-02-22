import { shallow } from 'enzyme';
import React from 'react';

import { Select } from '../Select';

import SelectInput from './SelectInput';

describe('SelectInput', () => {
    const options = [
        { item: 'Foo', value: 'foo' },
        { item: 'Bar', value: 'bar' },
        { item: 'Baz', value: 'baz' },
    ];

    it('renders Select element', () => {
        const component = shallow(<SelectInput name="foobar" options={options} />);

        expect(component.find(Select)).toHaveLength(1);
    });

    it('renders with class names', () => {
        const component = shallow(
            <SelectInput additionalClassName="foobar" name="foobar" options={options} />,
        );

        expect(component.find(Select).hasClass('form-select')).toBe(true);

        expect(component.find(Select).hasClass('optimizedCheckout-form-select')).toBe(true);

        expect(component.find(Select).hasClass('foobar')).toBe(true);
    });

    it('appears focused if configured', () => {
        const component = shallow(<SelectInput appearFocused name="foobar" options={options} />);

        expect(component.find(Select).hasClass('form-select--focus')).toBe(true);

        expect(component.find(Select).hasClass('optimizedCheckout-form-select--focus')).toBe(true);
    });

    it('does not appear focused unless configured', () => {
        const component = shallow(
            <SelectInput appearFocused={false} name="foobar" options={options} />,
        );

        expect(component.find(Select).hasClass('form-select--focus')).toBe(false);

        expect(component.find(Select).hasClass('optimizedCheckout-form-select--focus')).toBe(false);
    });
});
