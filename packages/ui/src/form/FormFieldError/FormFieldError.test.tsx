import userEvent from '@testing-library/user-event';
import { Formik } from 'formik';
import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import { BasicFormField } from '../BasicFormField';
import { FormContext } from '../contexts';

import FormFieldError, { type FormFieldErrorProps } from './FormFieldError';

describe('FormFieldError', () => {
    let defaultProps: FormFieldErrorProps;

    beforeEach(() => {
        defaultProps = {
            name: 'foobar',
            errorId: '',
        };
    });

    it('renders formfielderror component with message', async () => {
        const { container } = render(
            <FormContext.Provider value={{ isSubmitted: true, setSubmitted: jest.fn() }}>
                <Formik
                    initialValues={{ foobar: '' }}
                    onSubmit={jest.fn()}
                    render={() => (
                        <>
                            <BasicFormField
                                name="foobar"
                                testId="input"
                                validate={() => 'Invalid'}
                            />
                            <FormFieldError {...defaultProps} />
                        </>
                    )}
                />
            </FormContext.Provider>,
        );

        // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
        const inputElement = container.querySelector('input[name="foobar"]');

        expect(inputElement).toBeInTheDocument();

        if (inputElement) {
            await userEvent.type(inputElement, 'test');
        }

        await userEvent.tab();

        expect(screen.getByText('Invalid')).toBeInTheDocument();
    });
});
