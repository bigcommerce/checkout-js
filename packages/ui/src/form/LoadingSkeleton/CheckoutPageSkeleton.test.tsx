import { render, screen } from '@testing-library/react';
import React from 'react';

jest.mock('../../utils', () => ({
    isMobileView: jest.fn(),
}));

import { isMobileView } from '../../utils';

import CheckoutPageSkeleton from './CheckoutPageSkeleton';

describe('CheckoutPageSkeleton', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders desktop skeleton when not mobile', () => {
        (isMobileView as jest.Mock).mockReturnValue(false);

        render(<CheckoutPageSkeleton />);

        expect(screen.getByTestId('checkout-page-skeleton')).toBeInTheDocument();
        expect(screen.queryByTestId('checkout-page-skeleton-mobile')).not.toBeInTheDocument();
    });

    it('renders mobile skeleton when isMobileView is true', () => {
        (isMobileView as jest.Mock).mockReturnValue(true);

        render(<CheckoutPageSkeleton />);

        expect(screen.getByTestId('checkout-page-skeleton-mobile')).toBeInTheDocument();
        expect(screen.queryByTestId('checkout-page-skeleton')).not.toBeInTheDocument();
    });
});
