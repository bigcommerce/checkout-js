import { Formik } from 'formik';
import React from 'react';

import { type PaymentFormField } from '@bigcommerce/checkout/payment-integration-api';
import { fireEvent, render, screen } from '@bigcommerce/checkout/test-utils';

import PaymentFormFields from './PaymentFormFields';

const fields: PaymentFormField[] = [
    {
        name: 'Purchase Order',
        id: 'purchaseOrderNumber',
        required: true,
        type: 'number',
        fieldType: 'text',
    },
    {
        name: 'Reference',
        id: 'referenceText',
        required: false,
        type: 'text',
        fieldType: 'text',
    },
];

const renderWithFormik = (ui: React.ReactElement) =>
    render(
        <Formik initialValues={{}} onSubmit={jest.fn()}>
            {ui}
        </Formik>,
    );

describe('PaymentFormFields', () => {
    it('renders a label and input for each field', () => {
        renderWithFormik(<PaymentFormFields fields={fields} />);

        expect(screen.getByLabelText('Purchase Order')).toBeInTheDocument();
        expect(screen.getByLabelText('Reference')).toBeInTheDocument();
    });

    it('uses numeric inputMode for number type fields', () => {
        renderWithFormik(<PaymentFormFields fields={fields} />);

        expect(screen.getByLabelText('Purchase Order')).toHaveAttribute('inputmode', 'numeric');
        expect(screen.getByLabelText('Reference')).not.toHaveAttribute('inputmode');
    });

    it('strips non-digit characters from a number field on change', () => {
        renderWithFormik(<PaymentFormFields fields={fields} />);

        const input = screen.getByLabelText('Purchase Order');

        fireEvent.change(input, { target: { value: '123abc' } });

        expect((input as HTMLInputElement).value).toBe('123');
    });

    it('shows a validation error for a required field left empty', async () => {
        renderWithFormik(<PaymentFormFields fields={fields} />);

        fireEvent.blur(screen.getByLabelText('Purchase Order'));

        expect(await screen.findByText('Purchase Order is required')).toBeInTheDocument();
    });

    it('does not show a validation error for an optional field left empty', () => {
        renderWithFormik(<PaymentFormFields fields={fields} />);

        fireEvent.blur(screen.getByLabelText('Reference'));

        expect(screen.queryByText('Reference is required')).not.toBeInTheDocument();
    });
});
