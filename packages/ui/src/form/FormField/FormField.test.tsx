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

    it('renders labelContent when label is null', () => {
        render(
            <Formik
                initialValues={{ foobar: '' }}
                onSubmit={jest.fn()}
                render={() => (
                    <FormField
                        {...defaultProps}
                        label={null}
                        labelContent={<div>label content</div>}
                    />
                )}
            />,
        );

        expect(screen.getByText('label content')).toBeInTheDocument();
    });

    it('does not render empty label element when labelContent is null', () => {
        render(
            <Formik
                initialValues={{ foobar: '' }}
                onSubmit={jest.fn()}
                render={() => <FormField {...defaultProps} labelContent={null} />}
            />,
        );

        expect(document.getElementById('test-label')).toBeNull();
    });

    it('does not render empty label element when labelContent is undefined', () => {
        render(
            <Formik
                initialValues={{ foobar: '' }}
                onSubmit={jest.fn()}
                render={() => <FormField {...defaultProps} labelContent={undefined} />}
            />,
        );

        expect(document.getElementById('test-label')).toBeNull();
    });

    it('does not render labelContent when label prop is defined', () => {
        const label = () => <div>label text</div>;

        render(
            <Formik
                initialValues={{ foobar: '' }}
                onSubmit={jest.fn()}
                render={() => (
                    <FormField
                        {...defaultProps}
                        label={label}
                        labelContent={<div>label content text</div>}
                    />
                )}
            />,
        );

        expect(screen.getByText('label text')).toBeInTheDocument();
        expect(screen.queryByText('label content text')).not.toBeInTheDocument();
    });
});
