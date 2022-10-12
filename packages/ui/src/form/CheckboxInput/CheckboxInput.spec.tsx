import { shallow } from 'enzyme';
import React from 'react';

import { Input } from '../Input';
import { Label } from '../Label';

import CheckboxInput from './CheckboxInput';

describe('CheckboxInput', () => {
    it('renders `input` element', () => {
        const component = shallow(
            <CheckboxInput checked={false} label="label" name="foobar" value="x" />,
        );

        expect(component.find(Input).prop('type')).toBe('checkbox');
    });

    it('renders with passed props', () => {
        const component = shallow(
            <CheckboxInput checked={false} id="id" label="label" name="foobar" value="x" />,
        );

        expect(component.find(Label).props()).toEqual(
            expect.objectContaining({
                children: 'label',
                htmlFor: 'id',
            }),
        );

        expect(component.find(Input).props()).toEqual(
            expect.objectContaining({
                checked: false,
                value: 'x',
                id: 'id',
            }),
        );
    });

    it('renders with class names', () => {
        const component = shallow(
            <CheckboxInput checked={false} label="label" name="foobar" value="x" />,
        );

        expect(component.find(Input).hasClass('form-checkbox')).toBe(true);

        expect(component.find(Input).hasClass('optimizedCheckout-form-checkbox')).toBe(true);
    });
});
