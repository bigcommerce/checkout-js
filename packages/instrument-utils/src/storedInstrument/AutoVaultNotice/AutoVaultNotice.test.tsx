import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import AutoVaultNotice from './AutoVaultNotice';

describe('AutoVaultNotice', () => {
    it('renders the auto-vault compliance copy', () => {
        render(<AutoVaultNotice />);

        expect(
            screen.getByText(
                'By providing your card information and placing this order, you agree that your card may be charged for future payments in accordance with the terms of the merchant.',
            ),
        ).toBeInTheDocument();
    });

    it('renders the copy with the app-standard smaller secondary-text styling', () => {
        render(<AutoVaultNotice />);

        const notice = screen.getByText(/placing this order/i);

        // Reuses the existing Order Summary mechanism: the themeable
        // optimizedCheckout-contentSecondary (secondary colour) + sub-text-medium
        // (~11px) classes — a little smaller than the 13px body text.
        expect(notice.tagName).toBe('P');
        expect(notice).toHaveClass('optimizedCheckout-contentSecondary');
        expect(notice).toHaveClass('sub-text-medium');
    });
});
