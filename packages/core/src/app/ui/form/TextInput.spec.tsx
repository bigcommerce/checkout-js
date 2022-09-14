import { shallow } from 'enzyme';
import React from 'react';

import Input from './Input';
import TextInput from './TextInput';

describe('TextInput', () => {
    it('renders Input element', () => {
        const component = shallow(<TextInput name="foobar" />);

        expect(component.find(Input)).toHaveLength(1);
    });

    it('renders with class names', () => {
        const component = shallow(<TextInput additionalClassName="foobar" name="foobar" />);

        expect(component.find(Input).hasClass('form-input')).toBe(true);

        expect(component.find(Input).hasClass('optimizedCheckout-form-input')).toBe(true);

        expect(component.find(Input).hasClass('foobar')).toBe(true);
    });

    it('appears focused if configured', () => {
        const component = shallow(<TextInput appearFocused name="foobar" />);

        expect(component.find(Input).hasClass('form-input--focus')).toBe(true);

        expect(component.find(Input).hasClass('optimizedCheckout-form-input--focus')).toBe(true);
    });

    it('does not appear focused unless configured', () => {
        const component = shallow(<TextInput appearFocused={false} name="foobar" />);

        expect(component.find(Input).hasClass('form-input--focus')).toBe(false);

        expect(component.find(Input).hasClass('optimizedCheckout-form-input--focus')).toBe(false);
    });
});
