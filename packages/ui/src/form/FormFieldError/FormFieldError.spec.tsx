import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { BasicFormField } from '../BasicFormField';
import { FormContext } from '../contexts';

import FormFieldError from './FormFieldError';

describe('FormFieldError', () => {
    it('renders component with test ID', async () => {
        const component = mount(
            <FormContext.Provider value={{ isSubmitted: true, setSubmitted: jest.fn() }}>
                <Formik
                    initialValues={{ foobar: '' }}
                    onSubmit={noop}
                    render={() => (
                        <>
                            <BasicFormField name="foobar" validate={() => 'Invalid'} />
                            <FormFieldError errorId="" name="foobar" testId="test" />
                        </>
                    )}
                />
            </FormContext.Provider>,
        );

        component
            .find('input[name="foobar"]')
            .simulate('change', { target: { value: '123', name: 'foobar' } })
            .simulate('blur');

        await new Promise((resolve) => process.nextTick(resolve));

        component.update();

        expect(component.find('.form-field-errors').prop('data-test')).toBe('test');
    });

    it('renders error message', async () => {
        const component = mount(
            <FormContext.Provider value={{ isSubmitted: true, setSubmitted: jest.fn() }}>
                <Formik
                    initialValues={{ foobar: '' }}
                    onSubmit={noop}
                    render={() => (
                        <>
                            <BasicFormField name="foobar" validate={() => 'Invalid'} />
                            <FormFieldError errorId="" name="foobar" testId="test" />
                        </>
                    )}
                />
            </FormContext.Provider>,
        );

        component
            .find('input[name="foobar"]')
            .simulate('change', { target: { value: '123', name: 'foobar' } })
            .simulate('blur');

        await new Promise((resolve) => process.nextTick(resolve));

        component.update();

        expect(component.find('.form-field-errors').text()).toBe('Invalid');
    });
});
