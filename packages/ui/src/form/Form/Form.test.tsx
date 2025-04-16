import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import Form from './Form';

describe('form', () => {
    it('renders form component', () => {
        render(<Form data-testid="form">form</Form>);

        expect(screen.getByText('form')).toBeInTheDocument();
    });
});
