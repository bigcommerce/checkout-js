import { Formik } from 'formik';
import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import FormField, { type FormFieldProps } from './FormField';

describe('FormField', () => {
    let defaultProps: FormFieldProps;

    beforeEach(() => {
        defaultProps = {
            additionalClassName: 'test',
            labelContent: null,
            label: null,
            onChange: jest.fn(),
            footer: null,
            input: jest.fn(),
            name: 'test',
        };
    });

    it('renders formfield component with label', () => {
        const label = () => <div>label</div>;

        render(
            <Formik
                initialValues={{ foobar: '' }}
                onSubmit={jest.fn()}
                render={() => <FormField {...defaultProps} label={label} />}
            />,
        );

        expect(screen.getByText('label')).toBeInTheDocument();
    });

    it('renders formfield component with label content', () => {
        const labelContent = () => <div>label content</div>;

        render(
            <Formik
                initialValues={{ foobar: '' }}
                onSubmit={jest.fn()}
                render={() => <FormField {...defaultProps} labelContent={labelContent()} />}
            />,
        );

        expect(screen.getByText('label content')).toBeInTheDocument();
    });
});
