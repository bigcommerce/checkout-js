import { mount, shallow } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { FormContext } from '../contexts';

import BasicFormField from './BasicFormField';

describe('BasicFormField', () => {
    it('matches snapshot', () => {
        expect(shallow(<BasicFormField name="foobar" />)).toMatchSnapshot();
    });

    it('renders component with test ID', () => {
        const component = mount(
            <Formik
                initialValues={{ foobar: 'foobar' }}
                onSubmit={noop}
                render={() => <BasicFormField name="foobar" testId="test" />}
            />,
        );

        expect(component.find('.form-field').prop('data-test')).toBe('test');
    });

    it('changes appearance when there is error', async () => {
        const component = mount(
            <FormContext.Provider value={{ isSubmitted: true, setSubmitted: jest.fn() }}>
                <Formik
                    initialValues={{ foobar: '' }}
                    onSubmit={noop}
                    render={() => (
                        <BasicFormField
                            name="foobar"
                            render={({ field }) => <input {...field} type="text" />}
                            validate={() => 'Invalid'}
                        />
                    )}
                />
            </FormContext.Provider>,
        );

        component.find('input[name="foobar"]').simulate('change').simulate('blur');

        await new Promise((resolve) => process.nextTick(resolve));

        component.update();

        expect(component.find('.form-field').hasClass('form-field--error')).toBe(true);
    });

    it('renders input component by default', () => {
        const component = mount(
            <Formik
                initialValues={{ foobar: '' }}
                onSubmit={noop}
                render={() => <BasicFormField name="foobar" />}
            />,
        );

        expect(component.exists('input')).toBe(true);
    });

    it('renders input component with date value', async () => {
        const component = mount(
            <Formik
                initialValues={{ foobar: '' }}
                onSubmit={noop}
                render={() => <BasicFormField name="foobar" />}
            />,
        );

        const date = new Date();

        component
            .find('input[name="foobar"]')
            .simulate('change', { target: { value: date, name: 'foobar' } })
            .simulate('blur');

        await new Promise((resolve) => process.nextTick(resolve));

        component.update();

        const input = component.find('input');

        expect(component.exists('input')).toBe(true);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(input.get(0).props.value).toBe(date);
    });
});
