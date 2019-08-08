import { shallow } from 'enzyme';
import React from 'react';

import Input from './Input';
import Label from './Label';
import RadioInput from './RadioInput';

describe('RadioInput', () => {
    it('renders `input` element', () => {
        const component = shallow(<RadioInput label="label" value="x" name="foobar" checked={ false } />);

        expect(component.find(Input).prop('type'))
            .toEqual('radio');
    });

    it('renders with passed props', () => {
        const component = shallow(<RadioInput id="id" label="label" value="x" name="foobar" checked={ false } />);

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
        const component = shallow(<RadioInput label="label" value="x" name="foobar" checked={ false } />);

        expect(component.find(Input).hasClass('form-radio'))
            .toEqual(true);

        expect(component.find(Input).hasClass('optimizedCheckout-form-radio'))
            .toEqual(true);
    });
});
