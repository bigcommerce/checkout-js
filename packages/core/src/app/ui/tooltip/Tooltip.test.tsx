import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import Tooltip from './Tooltip';

describe('Tooltip', () => {
    it('displays tooltip text and has expected CSS class', () => {
        const { container } = render(<Tooltip>Hello world</Tooltip>);

        expect(screen.getByText('Hello world')).toBeInTheDocument();
        expect(container.firstChild).toHaveClass('tooltip');
    });

    it('has expected test ID attribute', () => {
        render(<Tooltip testId="foobar">Hello world</Tooltip>);

        expect(screen.getByTestId('foobar')).toBeInTheDocument();
    });
});
