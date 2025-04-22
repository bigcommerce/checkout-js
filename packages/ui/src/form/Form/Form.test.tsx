import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import Form from './Form';

describe('form', () => {
    it('renders form component', () => {
        render(
            <Formik initialValues={null} onSubmit={noop}>
                <Form data-testid="form">form</Form>
            </Formik>,
        );

        expect(screen.getByText('form')).toBeInTheDocument();
    });
});
