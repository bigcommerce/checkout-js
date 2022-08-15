import { mount, render } from 'enzyme';
import { Form as FormikForm } from 'formik';
import React from 'react';

import Form from './Form';

describe('Form', () => {
    it('matches snapshot', () => {
        expect(render(<Form>Hello world</Form>)).toMatchSnapshot();
    });

    it('disables browser validation', () => {
        expect(
            mount(<Form>Hello world</Form>)
                .find(FormikForm)
                .prop('noValidate'),
        ).toBe(true);
    });
});
