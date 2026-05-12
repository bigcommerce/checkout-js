import { Formik } from 'formik';
import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import { Checklist } from './Checklist';

const renderChecklist = (children?: React.ReactNode) =>
    render(
        <Formik initialValues={{ payment: '' }} onSubmit={jest.fn()}>
            <Checklist name="payment">{children}</Checklist>
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
});
