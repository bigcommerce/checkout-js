import { render, screen } from '@testing-library/react';
import React from 'react';

jest.mock('../../utils', () => ({
    isMobileView: jest.fn(),
}));

import { isMobileView } from '../../utils';

import OrderConfirmationPageSkeleton from './OrderConfirmationPageSkeleton';

describe('OrderConfirmationPageSkeleton', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders desktop skeleton when not mobile', () => {
        (isMobileView as jest.Mock).mockReturnValue(false);

        render(<OrderConfirmationPageSkeleton />);

        expect(screen.getByTestId('order-confirmation-page-skeleton')).toBeInTheDocument();
        expect(
            screen.queryByTestId('order-confirmation-page-skeleton-mobile'),
        ).not.toBeInTheDocument();
    });

    it('renders mobile skeleton when isMobileView is true', () => {
        (isMobileView as jest.Mock).mockReturnValue(true);

        render(<OrderConfirmationPageSkeleton />);

        expect(screen.getByTestId('order-confirmation-page-skeleton-mobile')).toBeInTheDocument();
        expect(screen.queryByTestId('order-confirmation-page-skeleton')).not.toBeInTheDocument();
    });
});
