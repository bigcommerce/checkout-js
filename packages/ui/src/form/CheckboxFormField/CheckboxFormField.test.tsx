import userEvent from '@testing-library/user-event';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import CheckboxFormField from './CheckboxFormField';

describe('CheckboxFormField', () => {
    it('renders form field with checkbox and sets initial checked value', () => {
        render(
            <Formik
                initialValues={{ foobar: true }}
                onSubmit={noop}
                render={() => <CheckboxFormField labelContent="Foobar" name="foobar" />}
            />,
        );

        expect(screen.getByLabelText('Foobar')).toBeInTheDocument();
        expect(screen.getByLabelText('Foobar')).toBeChecked();
    });

    it('updates checked value when clicked', async () => {
        render(
            <Formik
                initialValues={{ foobar: true }}
                onSubmit={noop}
                render={() => <CheckboxFormField labelContent="Foobar" name="foobar" />}
            />,
        );

        await userEvent.click(screen.getByLabelText('Foobar'));

        expect(screen.getByLabelText('Foobar')).not.toBeChecked();
    });
});
