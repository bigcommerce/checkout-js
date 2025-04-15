import userEvent from '@testing-library/user-event';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React from 'react';

import { render, screen, within } from '@bigcommerce/checkout/test-utils';

import { FormContext } from '../contexts';

import BasicFormField from './BasicFormField';

describe('BasicFormField', () => {
    it('matches snapshot', () => {
        render(
            <Formik
                initialValues={{ foobar: 'foobar' }}
                onSubmit={noop}
                render={() => <BasicFormField name="foobar" />}
            />,
        );

        expect(screen.getByRole('textbox')).toHaveAttribute('name', 'foobar');
    });

    it('renders component with test ID', () => {
        render(
            <Formik
                initialValues={{ foobar: 'foobar' }}
                onSubmit={noop}
                render={() => <BasicFormField name="foobar" testId="test" />}
            />,
        );

        expect(screen.getByTestId('test')).toBeInTheDocument();
        expect(within(screen.getByTestId('test')).getByRole('textbox')).toHaveAttribute(
            'name',
            'foobar',
        );
    });

    it('changes appearance when there is error', async () => {
        const { container } = render(
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

        await userEvent.type(screen.getByRole('textbox'), 'test');
        await userEvent.tab();

        // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
        expect(container.querySelector('.form-field--error')).toBeInTheDocument();
    });

    it('renders input component with date value', async () => {
        render(
            <Formik
                initialValues={{ foobar: '' }}
                onSubmit={noop}
                render={() => <BasicFormField name="foobar" />}
            />,
        );

        const date = new Date();

        await userEvent.type(screen.getByRole('textbox'), date.toLocaleDateString());

        expect(screen.getByRole('textbox')).toHaveValue(date.toLocaleDateString());
    });
});
