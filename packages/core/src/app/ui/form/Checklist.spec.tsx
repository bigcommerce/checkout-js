import { mount } from 'enzyme';
import { Field, Form, Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import Checklist from './Checklist';
import ChecklistItem from './ChecklistItem';

describe('Checklist', () => {
    let items: Array<{ label: string; id: string }>;
    let initialValues: { option: string };

    beforeEach(() => {
        items = [
            { label: 'Foo', id: 'foo' },
            { label: 'Bar', id: 'bar' },
        ];

        initialValues = {
            option: '',
        };
    });

    it('selects default item when component is mounted', () => {
        const component = mount(
            <Formik initialValues={initialValues} onSubmit={noop}>
                <Form>
                    <Checklist defaultSelectedItemId="bar" name="option">
                        {items.map(({ label, id }) => (
                            <ChecklistItem key={id} label={label} value={id} />
                        ))}
                    </Checklist>
                </Form>
            </Formik>,
        );

        expect(component.find('.form-checklist-item--selected').text()).toBe('Bar');
    });

    it('provides name property to child checklist items', () => {
        const component = mount(
            <Formik initialValues={initialValues} onSubmit={noop}>
                <Form>
                    <Checklist name="option">
                        {items.map(({ label, id }) => (
                            <ChecklistItem key={id} label={label} value={id} />
                        ))}
                    </Checklist>
                </Form>
            </Formik>,
        );

        expect(component.find(Field).at(0).prop('name')).toBe('option');

        expect(component.find(Field).at(1).prop('name')).toBe('option');
    });

    it('changes selected item when user interacts with input element', () => {
        const component = mount(
            <Formik initialValues={initialValues} onSubmit={noop}>
                <Form>
                    <Checklist name="option">
                        {items.map(({ label, id }) => (
                            <ChecklistItem key={id} label={label} value={id} />
                        ))}
                    </Checklist>
                </Form>
            </Formik>,
        );

        component
            .find('#foo .form-checklist-checkbox')
            .at(0)
            .simulate('change', { target: { value: 'foo', name: 'option' } })
            .update();

        expect(component.find('.form-checklist-header--selected').text()).toBe('Foo');
    });

    it('triggers callback when different item is selected', () => {
        const handleSelect = jest.fn();
        const component = mount(
            <Formik initialValues={initialValues} onSubmit={noop}>
                <Form>
                    <Checklist name="option" onSelect={handleSelect}>
                        {items.map(({ label, id }) => (
                            <ChecklistItem key={id} label={label} value={id} />
                        ))}
                    </Checklist>
                </Form>
            </Formik>,
        );

        component
            .find('#foo .form-checklist-checkbox')
            .at(0)
            .simulate('change', { target: { value: 'foo', name: 'option' } })
            .update();

        expect(handleSelect).toHaveBeenCalledWith('foo');
    });

    it('passes selected item value when form is submitted', async () => {
        const handleSubmit = jest.fn();
        const component = mount(
            <Formik initialValues={initialValues} onSubmit={handleSubmit}>
                <Form>
                    <Checklist defaultSelectedItemId="bar" name="option">
                        {items.map(({ label, id }) => (
                            <ChecklistItem key={id} label={label} value={id} />
                        ))}
                    </Checklist>

                    <button>Submit</button>
                </Form>
            </Formik>,
        );

        component
            .find('#foo .form-checklist-checkbox')
            .at(0)
            .simulate('change', { target: { value: 'foo', name: 'option' } });

        component.find('form').simulate('submit');

        await new Promise((resolve) => process.nextTick(resolve));

        expect(handleSubmit).toHaveBeenCalledWith({ option: 'foo' }, expect.any(Object));
    });
});
