import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import TextInput from './TextInput';

describe('TextInput', () => {
    it('renders Input element', () => {
        render(<TextInput name="foobar" />);

        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders with class names', () => {
        render(<TextInput additionalClassName="foobar" name="foobar" />);

        expect(screen.getByRole('textbox')).toHaveClass('form-input');
        expect(screen.getByRole('textbox')).toHaveClass('optimizedCheckout-form-input');
        expect(screen.getByRole('textbox')).toHaveClass('foobar');
    });

    it('appears focused if configured', () => {
        render(<TextInput appearFocused name="foobar" />);

        expect(screen.getByRole('textbox')).toHaveClass('form-input--focus');
        expect(screen.getByRole('textbox')).toHaveClass('optimizedCheckout-form-input--focus');
    });

    it('does not appear focused unless configured', () => {
        render(<TextInput appearFocused={false} name="foobar" />);

        expect(screen.getByRole('textbox')).not.toHaveClass('form-input--focus');
        expect(screen.getByRole('textbox')).not.toHaveClass('optimizedCheckout-form-input--focus');
    });
});
