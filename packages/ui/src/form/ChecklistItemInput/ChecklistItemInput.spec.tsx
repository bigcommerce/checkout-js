import { mount, shallow } from 'enzyme';
import React from 'react';

import { Label } from '../Label';

import ChecklistItemInput from './ChecklistItemInput';

describe('ChecklistItemInput', () => {
    it('renders children inside label', () => {
        const component = shallow(
            <ChecklistItemInput isSelected={false} name="foobar" value="foobar_val">
                children text
            </ChecklistItemInput>,
        );

        expect(component.find(Label).dive().text()).toBe('children text');
    });

    it('renders input as checked when is selected', () => {
        const component = shallow(
            <ChecklistItemInput isSelected={true} name="foobar" value="foobar_val" />,
        );

        expect(component.find('.form-checklist-checkbox').prop('checked')).toBe(true);
    });

    it('renders input as unchecked when is not selected', () => {
        const component = shallow(
            <ChecklistItemInput isSelected={false} name="foobar" value="foobar_val" />,
        );

        expect(component.find('.form-checklist-checkbox').prop('checked')).toBe(false);
    });

    it('calls onChange when input changes', () => {
        const onChange = jest.fn();
        const component = mount(
            <ChecklistItemInput
                isSelected={true}
                name="foobar"
                onChange={onChange}
                value="foobar_val"
            />,
        );

        component
            .find('.form-checklist-checkbox')
            .at(0)
            .simulate('change', { target: { value: 'foo', name: 'option' } });

        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({ target: { value: 'foo', name: 'option' } }),
        );
    });
});
