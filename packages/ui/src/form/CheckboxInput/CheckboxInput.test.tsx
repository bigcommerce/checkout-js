import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import CheckboxInput from './CheckboxInput';

describe('CheckboxInput', () => {
    it('renders `input` element with passed props', () => {
        render(
            <CheckboxInput
                checked={false}
                id="id"
                label="label"
                name="foobar"
                onChange={jest.fn()}
                value="x"
            />,
        );

        expect(screen.getByRole('checkbox')).toBeInTheDocument();
        expect(screen.getByRole('checkbox')).toHaveAttribute('name', 'foobar');
        expect(screen.getByRole('checkbox')).not.toBeChecked();
        expect(screen.getByRole('checkbox')).toHaveAttribute('id', 'id');
    });

    it('renders with class names', () => {
        render(
            <CheckboxInput
                checked={false}
                label="label"
                name="foobar"
                onChange={jest.fn()}
                value="x"
            />,
        );

        expect(screen.getByRole('checkbox')).toHaveClass('form-checkbox');
        expect(screen.getByRole('checkbox')).toHaveClass('optimizedCheckout-form-checkbox');
    });
});
