import { ErrorMessage, useFormikContext } from 'formik';
import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';
import { FormContext } from '@bigcommerce/checkout/ui';

import FormFieldError, { type FormFieldErrorProps } from './FormFieldError';

jest.mock('formik', () => ({
    ...jest.requireActual('formik'),
    useFormikContext: jest.fn(),
    ErrorMessage: jest.fn(({ render }) => render('Test error message')),
}));

describe('FormFieldError', () => {
    const defaultProps: FormFieldErrorProps = {
        name: 'testField',
        testId: 'test-field-error',
        errorId: 'test-error-id',
    };

    const mockFormikContext = (errors = {}, touched = {}) => {
        (useFormikContext as jest.Mock).mockReturnValue({
            errors,
            touched,
        });
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders error message when there is an error', () => {
        mockFormikContext({ testField: 'Error message' }, { testField: true });

        render(
            <FormContext.Provider value={{ isSubmitted: true, setSubmitted: jest.fn() }}>
                <FormFieldError {...defaultProps} />
            </FormContext.Provider>
        );

        expect(screen.getByRole('alert')).toHaveTextContent('Test error message');
    });

    it('does not render error message when field is not touched', () => {
        mockFormikContext({ testField: 'Error message' }, { testField: false });

        render(
            <FormContext.Provider value={{ isSubmitted: true, setSubmitted: jest.fn() }}>
                <FormFieldError {...defaultProps} />
            </FormContext.Provider>
        );

        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('renders hidden span when there is no error', () => {
        mockFormikContext({}, {});

        render(
            <FormContext.Provider value={{ isSubmitted: false, setSubmitted: jest.fn() }}>
                <FormFieldError {...defaultProps} />
            </FormContext.Provider>
        );

        const hiddenSpan = screen.getByTestId('test-field-error').querySelector('.is-srOnly');

        expect(hiddenSpan).toBeInTheDocument();
        expect(hiddenSpan).toHaveAttribute('aria-hidden', 'true');
    });

    it('passes correct props to ErrorMessage component', () => {
        mockFormikContext({ testField: 'Error message' }, { testField: true });

        render(
            <FormContext.Provider value={{ isSubmitted: true, setSubmitted: jest.fn() }}>
                <FormFieldError {...defaultProps} />
            </FormContext.Provider>
        );

        expect(ErrorMessage).toHaveBeenCalledWith(
            expect.objectContaining({
                name: defaultProps.name,
                render: expect.any(Function),
            }),
            {}
        );
    });

    it('renders with proper accessibility attributes', () => {
        mockFormikContext({ testField: 'Error message' }, { testField: true });

        render(
            <FormContext.Provider value={{ isSubmitted: true, setSubmitted: jest.fn() }}>
                <FormFieldError {...defaultProps} />
            </FormContext.Provider>
        );

        const alertLabel = screen.getByRole('alert');

        expect(alertLabel).toHaveAttribute('aria-live', 'polite');
        expect(alertLabel).toHaveAttribute('id', defaultProps.errorId);
    });
});
