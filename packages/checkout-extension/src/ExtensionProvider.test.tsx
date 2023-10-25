import { createCheckoutService } from '@bigcommerce/checkout-sdk';
import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

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
