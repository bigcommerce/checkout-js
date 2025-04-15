import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import RadioInput from './RadioInput';

describe('RadioInput', () => {
    it('renders `input` element', () => {
        render(
            <RadioInput
                checked={false}
                label="label"
                name="foobar"
                onChange={jest.fn()}
                value="x"
            />,
        );

        expect(screen.getByRole('radio')).toBeInTheDocument();
    });

    it('renders with passed props', () => {
        render(
            <RadioInput
                checked={false}
                id="id"
                label="label"
                name="foobar"
                onChange={jest.fn()}
                value="x"
            />,
        );

        expect(screen.getByRole('radio')).toBeInTheDocument();
        expect(screen.getByRole('radio')).toHaveAttribute('name', 'foobar');
        expect(screen.getByRole('radio')).not.toBeChecked();
        expect(screen.getByRole('radio')).toHaveAttribute('id', 'id');
        expect(screen.getByLabelText('label')).toBeInTheDocument();
    });

    it('renders with class names', () => {
        render(
            <RadioInput
                checked={false}
                label="label"
                name="foobar"
                onChange={jest.fn()}
                value="x"
            />,
        );

        const component = screen.getByRole('radio');

        expect(component).toHaveClass('form-radio');
        expect(component).toHaveClass('optimizedCheckout-form-radio');
    });
});
