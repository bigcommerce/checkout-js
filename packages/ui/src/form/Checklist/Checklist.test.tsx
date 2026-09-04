import { Formik, useFormikContext } from 'formik';
import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import { Checklist } from './Checklist';

const FormikValue = ({ name }: { name: string }) => {
    const { values } = useFormikContext<Record<string, string>>();

    return <span data-test="formik-value">{values[name]}</span>;
};

const renderChecklist = (children?: React.ReactNode, defaultSelectedItemId?: string) =>
    render(
        <Formik initialValues={{ shippingOptionId: '' }} onSubmit={jest.fn()}>
            <>
                <Checklist defaultSelectedItemId={defaultSelectedItemId} name="shippingOptionId">
                    {children}
                </Checklist>
                <FormikValue name="shippingOptionId" />
            </>
        </Formik>,
    );

describe('Checklist', () => {
    it('renders provided children', () => {
        renderChecklist(<li>Child item</li>);

        expect(screen.getByText('Child item')).toBeInTheDocument();
    });

    it('renders accordion with correct class names', () => {
        renderChecklist();

        const accordion = screen.getByRole('list');

        expect(accordion).toHaveClass('form-checklist');
        expect(accordion).toHaveClass('optimizedCheckout-form-checklist');
    });

    it('initializes the formik field with the default selected item id', () => {
        renderChecklist(undefined, 'standard-shipping');

        expect(screen.getByTestId('formik-value')).toHaveTextContent('standard-shipping');
    });

    it('leaves the formik field empty when no default selected item id is provided', () => {
        renderChecklist();

        expect(screen.getByTestId('formik-value')).toBeEmptyDOMElement();
    });
});
