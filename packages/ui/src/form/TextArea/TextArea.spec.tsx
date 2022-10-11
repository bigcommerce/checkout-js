import { shallow } from 'enzyme';
import React from 'react';

import TextArea from './TextArea';

describe('TextArea', () => {
    it('renders `textarea` element', () => {
        const component = shallow(<TextArea name="foobar" />);

        expect(component.exists('textarea')).toBe(true);
    });

    it('renders with class names', () => {
        const component = shallow(<TextArea additionalClassName="foobar" name="foobar" />);

        expect(component.hasClass('form-input')).toBe(true);

        expect(component.hasClass('optimizedCheckout-form-input')).toBe(true);

        expect(component.hasClass('foobar')).toBe(true);
    });
});
