import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import TextArea from './TextArea';

describe('TextArea', () => {
    it('renders `textarea` element', () => {
        render(<TextArea name="foobar" />);

        expect(screen.getByRole('textbox')).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toHaveAttribute('name', 'foobar');
    });

    it('renders with class names', () => {
        render(<TextArea additionalClassName="foobar" name="foobar" />);

        const component = screen.getByRole('textbox');

        expect(component).toHaveClass('form-input');
        expect(component).toHaveClass('optimizedCheckout-form-input');
        expect(component).toHaveClass('foobar');
    });
});
