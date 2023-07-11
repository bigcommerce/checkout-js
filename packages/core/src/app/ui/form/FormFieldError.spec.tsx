import { mount } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { Fragment } from 'react';

import { FormProvider } from '@bigcommerce/checkout/ui';

import BasicFormField from './BasicFormField';
import FormFieldError from './FormFieldError';

describe('FormFieldError', () => {
    it('renders component with test ID', async () => {
        const component = mount(
            <FormProvider initialIsSubmitted={true}>
                <Formik
                    initialValues={{ foobar: '' }}
                    onSubmit={noop}
                    render={() => (
                        <>
                            <BasicFormField name="foobar" validate={() => 'Invalid'} />
                            <FormFieldError name="foobar" testId="test" />
                        </>
                    )}
                />
            </FormProvider>,
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
            <FormProvider initialIsSubmitted={true}>
                <Formik
                    initialValues={{ foobar: '' }}
                    onSubmit={noop}
                    render={() => (
                        <>
                            <BasicFormField name="foobar" validate={() => 'Invalid'} />
                            <FormFieldError name="foobar" testId="test" />
                        </>
                    )}
                />
            </FormProvider>,
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
