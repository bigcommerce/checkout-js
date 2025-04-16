import React from 'react';

import { render } from '@bigcommerce/checkout/test-utils';

import TextInputIframeContainer from './TextInputIframeContainer';

describe('TextInputIframeContainer', () => {
    it('renders container with default input CSS classes', () => {
        const { container } = render(<TextInputIframeContainer />);

        expect(container.firstChild).toHaveClass('form-input');
        expect(container.firstChild).toHaveClass('optimizedCheckout-form-input');
    });

    it('renders container with additional CSS classes', () => {
        const { container } = render(<TextInputIframeContainer additionalClassName="has-icon" />);

        expect(container.firstChild).toHaveClass('form-input');
        expect(container.firstChild).toHaveClass('optimizedCheckout-form-input');
        expect(container.firstChild).toHaveClass('has-icon');
    });

    it('renders container with focus styles', () => {
        const { container } = render(<TextInputIframeContainer appearFocused />);

        expect(container.firstChild).toHaveClass('form-input--focus');
        expect(container.firstChild).toHaveClass('optimizedCheckout-form-input--focus');
    });

    it('does not render container with focus styles unless specified', () => {
        const { container } = render(<TextInputIframeContainer appearFocused={false} />);

        expect(container.firstChild).not.toHaveClass('form-input--focus');
        expect(container.firstChild).not.toHaveClass('optimizedCheckout-form-input--focus');
    });
});
