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
        const component = shallow(<TextInput additionalClassName="foobar" name="foobar" />);

        expect(component.find(Input).hasClass('form-input'))
            .toEqual(true);

        expect(component.find(Input).hasClass('optimizedCheckout-form-input'))
            .toEqual(true);

        expect(component.find(Input).hasClass('foobar'))
            .toEqual(true);
    });

    it('appears focused if configured', () => {
        const component = shallow(<TextInput appearFocused name="foobar" />);

        expect(component.find(Input).hasClass('form-input--focus'))
            .toEqual(true);

        expect(component.find(Input).hasClass('optimizedCheckout-form-input--focus'))
            .toEqual(true);
    });

    it('does not appear focused unless configured', () => {
        const component = shallow(<TextInput appearFocused={ false } name="foobar" />);

        expect(component.find(Input).hasClass('form-input--focus'))
            .toEqual(false);

        expect(component.find(Input).hasClass('optimizedCheckout-form-input--focus'))
            .toEqual(false);
    });
});
