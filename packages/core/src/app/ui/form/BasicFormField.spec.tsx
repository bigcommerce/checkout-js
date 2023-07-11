import { mount, shallow } from 'enzyme';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { FormProvider } from '@bigcommerce/checkout/ui';

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
            <FormProvider initialIsSubmitted={true}>
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
            </FormProvider>,
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
});
