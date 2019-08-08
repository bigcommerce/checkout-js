import { shallow } from 'enzyme';
import React from 'react';

import Input from './Input';
import TextInput from './TextInput';

describe('TextInput', () => {
    it('renders Input element', () => {
        const component = shallow(<TextInput name="foobar" />);

        expect(component.find(Input).length)
            .toEqual(1);
    });

    it('renders with class names', () => {
        const component = shallow(<TextInput name="foobar" additionalClassName="foobar" />);

        expect(component.find(Input).hasClass('form-input'))
            .toEqual(true);

        expect(component.find(Input).hasClass('optimizedCheckout-form-input'))
            .toEqual(true);

        expect(component.find(Input).hasClass('foobar'))
            .toEqual(true);
    });
});
