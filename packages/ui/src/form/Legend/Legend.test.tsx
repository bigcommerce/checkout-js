import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import Legend from './Legend';

describe('Legend', () => {
    it('renders component with text and test ID', () => {
        render(<Legend testId="test">Hello world</Legend>);

        expect(screen.getByText('Hello world')).toBeInTheDocument();
        expect(screen.getByTestId('test')).toBeInTheDocument();
        expect(screen.getByTestId('test')).toHaveTextContent('Hello world');
    });

    it('renders component as hidden', () => {
        render(<Legend hidden>Hello world</Legend>);

        expect(screen.getByText('Hello world')).toHaveClass('is-srOnly');
    });

    it('renders component as heading by default', () => {
        render(<Legend>Hello world</Legend>);

        expect(screen.getByText('Hello world')).toHaveClass('optimizedCheckout-headingSecondary');
    });
});
