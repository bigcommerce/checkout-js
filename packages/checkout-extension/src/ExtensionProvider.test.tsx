import { createCheckoutService } from '@bigcommerce/checkout-sdk';
import { render, screen } from '@testing-library/react';
import React from 'react';

import { ExtensionProvider } from './ExtensionProvider';

describe('ExtensionProvider', () => {
    it('renders the children', () => {
        const checkoutService = createCheckoutService();

        render(
            <ExtensionProvider checkoutService={checkoutService}>
                <div data-test="child-component">Child Component</div>
            </ExtensionProvider>,
        );

        expect(screen.getByTestId('child-component')).toBeInTheDocument();
    });
});
