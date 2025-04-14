/* eslint-disable testing-library/no-container */
import React from 'react';

import { render } from '@bigcommerce/checkout/test-utils';

import TextInputIframeContainer from './TextInputIframeContainer';

describe('TextInputIframeContainer', () => {
    it('renders container with default input CSS classes', () => {
        const { container } = render(<TextInputIframeContainer />);

        expect(container.querySelector('.form-input')).toBeInTheDocument();
        expect(container.querySelector('.optimizedCheckout-form-input')).toBeInTheDocument();
    });

    it('renders container with additional CSS classes', () => {
        const { container } = render(<TextInputIframeContainer additionalClassName="has-icon" />);

        expect(container.querySelector('.form-input')).toBeInTheDocument();
        expect(container.querySelector('.optimizedCheckout-form-input')).toBeInTheDocument();
        expect(container.querySelector('.has-icon')).toBeInTheDocument();
    });

    it('renders container with focus styles', () => {
        const { container } = render(<TextInputIframeContainer appearFocused />);

        expect(container.querySelector('.form-input--focus')).toBeInTheDocument();
        expect(container.querySelector('.optimizedCheckout-form-input--focus')).toBeInTheDocument();
    });

    it('does not render container with focus styles unless specified', () => {
        const { container } = render(<TextInputIframeContainer appearFocused={false} />);

        expect(container.querySelector('.form-input--focus')).not.toBeInTheDocument();
        expect(container.querySelector('.optimizedCheckout-form-input--focus')).not.toBeInTheDocument();
    });
});
