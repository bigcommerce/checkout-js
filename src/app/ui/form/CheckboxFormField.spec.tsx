import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import CheckboxFormField from './CheckboxFormField';

describe('CheckboxFormField', () => {
    it('matches snapshot with rendered output', () => {
        const component = mount(
            <Formik
                initialValues={ { foobar: true } }
                onSubmit={ noop }
                render={ () => <CheckboxFormField name="foobar" labelContent="Foobar" /> }
            />
        );

        expect(component.html())
            .toMatchSnapshot();
    });

    it('renders form field with checkbox', () => {
        const component = mount(
            <Formik
                initialValues={ { foobar: true } }
                onSubmit={ noop }
                render={ () => <CheckboxFormField name="foobar" labelContent="Foobar" /> }
            />
        );

        expect(component.find('input[type="checkbox"]').length)
            .toEqual(1);

        expect(component.find('label').text())
            .toEqual('Foobar');
    });

    it('sets initial checked value', () => {
        const component = mount(
            <Formik
                initialValues={ { foobar: true } }
                onSubmit={ noop }
                render={ () => <CheckboxFormField name="foobar" labelContent="Foobar" /> }
            />
        );

        expect(component.find('input[type="checkbox"]').prop('checked'))
            .toEqual(true);
    });

    it('updates checked value when clicked', () => {
        const component = mount(
            <Formik
                initialValues={ { foobar: true } }
                onSubmit={ noop }
                render={ () => <CheckboxFormField name="foobar" labelContent="Foobar" /> }
            />
        );

        component.find('input[type="checkbox"]')
            .simulate('change', { target: { checked: false, name: 'foobar' } });

        expect(component.find('input[type="checkbox"]').prop('checked'))
            .toEqual(false);
    });
});
