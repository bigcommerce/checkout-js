import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { ExpiredTokenView } from './ExpiredTokenView';

describe('ExpiredTokenView', () => {
    const mockOnResendClick = jest.fn();
    const defaultProps = {
        orderId: 12345,
        onResendClick: mockOnResendClick,
    };

    beforeEach(() => {
        mockOnResendClick.mockReset();
    });

    it('renders expired message', () => {
        render(<ExpiredTokenView {...defaultProps} />);

        expect(screen.getByText('Link Expired')).toBeInTheDocument();
        expect(
            screen.getByText('For security, this link has expired.'),
        ).toBeInTheDocument();
    });

    it('renders resend button', () => {
        render(<ExpiredTokenView {...defaultProps} />);

        expect(
            screen.getByRole('button', { name: /resend secure link/i }),
        ).toBeInTheDocument();
    });

    it('calls onResendClick when button is clicked', async () => {
        mockOnResendClick.mockResolvedValue(undefined);

        render(<ExpiredTokenView {...defaultProps} />);

        const button = screen.getByRole('button', { name: /resend secure link/i });

        await userEvent.click(button);

        expect(mockOnResendClick).toHaveBeenCalledTimes(1);
    });

    it('shows loading state while resending', async () => {
        mockOnResendClick.mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 100)),
        );

        render(<ExpiredTokenView {...defaultProps} />);

        const button = screen.getByRole('button', { name: /resend secure link/i });

        await userEvent.click(button);

        expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled();
    });

    it('shows success message after successful resend', async () => {
        mockOnResendClick.mockResolvedValue(undefined);

        render(<ExpiredTokenView {...defaultProps} />);

        const button = screen.getByRole('button', { name: /resend secure link/i });

        await userEvent.click(button);

        await waitFor(() => {
            expect(
                screen.getByText(/a new link has been sent to your email address/i),
            ).toBeInTheDocument();
        });

        // Button should be hidden after success
        expect(screen.queryByRole('button', { name: /resend/i })).not.toBeInTheDocument();
    });

    it('shows error message when resend fails', async () => {
        const errorMessage = 'Too many requests';
        mockOnResendClick.mockRejectedValue(new Error(errorMessage));

        render(<ExpiredTokenView {...defaultProps} />);

        const button = screen.getByRole('button', { name: /resend secure link/i });

        await userEvent.click(button);

        await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
        });
    });

    it('shows generic error message when error has no message', async () => {
        mockOnResendClick.mockRejectedValue('string error');

        render(<ExpiredTokenView {...defaultProps} />);

        const button = screen.getByRole('button', { name: /resend secure link/i });

        await userEvent.click(button);

        await waitFor(() => {
            expect(
                screen.getByText(/failed to resend link\. please try again later/i),
            ).toBeInTheDocument();
        });
    });
});
