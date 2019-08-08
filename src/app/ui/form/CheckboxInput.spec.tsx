import { shallow } from 'enzyme';
import React from 'react';

import CheckboxInput from './CheckboxInput';
import Input from './Input';
import Label from './Label';

describe('CheckboxInput', () => {
    it('renders `input` element', () => {
        const component = shallow(<CheckboxInput label="label" value="x" name="foobar" checked={ false } />);

        expect(component.find(Input).prop('type'))
            .toEqual('checkbox');
    });

    it('renders with passed props', () => {
        const component = shallow(<CheckboxInput id="id" label="label" value="x" name="foobar" checked={ false } />);

        expect(component.find(Label).props())
            .toEqual(expect.objectContaining({
                children: 'label',
                htmlFor: 'id',
            }));

        expect(component.find(Input).props())
            .toEqual(expect.objectContaining({
                checked: false,
                value: 'x',
                id: 'id',
            }));
    });

    it('renders with class names', () => {
        const component = shallow(<CheckboxInput label="label" value="x" name="foobar" checked={ false } />);

        expect(component.find(Input).hasClass('form-checkbox'))
            .toEqual(true);

        expect(component.find(Input).hasClass('optimizedCheckout-form-checkbox'))
            .toEqual(true);
    });
});
