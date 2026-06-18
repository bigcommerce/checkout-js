import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import AutoVaultingDisclaimer from './AutoVaultingDisclaimer';

describe('AutoVaultingDisclaimer', () => {
    it('renders the auto-vaulting compliance copy', () => {
        render(<AutoVaultingDisclaimer />);

        expect(
            screen.getByText(
                'By providing your card information and placing this order, you agree that your card may be charged for future payments in accordance with the terms of the merchant.',
            ),
        ).toBeInTheDocument();
    });

    it('renders the copy with the app-standard smaller secondary-text styling', () => {
        render(<AutoVaultingDisclaimer />);

        const disclaimer = screen.getByText(/placing this order/i);

        expect(disclaimer.tagName).toBe('P');
        expect(disclaimer).toHaveClass('optimizedCheckout-secondaryDarkest');
        expect(disclaimer).toHaveClass('sub-text-medium');
    });
});
