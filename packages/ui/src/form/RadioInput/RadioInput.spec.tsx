import { shallow } from 'enzyme';
import React from 'react';

import { Input } from '../Input';
import { Label } from '../Label';

import RadioInput from './RadioInput';

describe('RadioInput', () => {
    it('renders `input` element', () => {
        const component = shallow(
            <RadioInput checked={false} label="label" name="foobar" value="x" />,
        );

        expect(component.find(Input).prop('type')).toBe('radio');
    });

    it('renders with passed props', () => {
        const component = shallow(
            <RadioInput checked={false} id="id" label="label" name="foobar" value="x" />,
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
            <RadioInput checked={false} label="label" name="foobar" value="x" />,
        );

        expect(component.find(Input).hasClass('form-radio')).toBe(true);

        expect(component.find(Input).hasClass('optimizedCheckout-form-radio')).toBe(true);
    });
});
