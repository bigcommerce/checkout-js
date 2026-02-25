import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { type ReactNode } from 'react';

import { LocaleContext } from '@bigcommerce/checkout/contexts';
import { createLocaleContext } from '@bigcommerce/checkout/locale';

import { getStoreConfig } from '../../config/config.mock';

import { ExpiredPermalinkView } from './ExpiredPermalinkView';

const localeContext = createLocaleContext(getStoreConfig());

const Wrapper = ({ children }: { children: ReactNode }) => (
    <LocaleContext.Provider value={localeContext}>
        {children}
    </LocaleContext.Provider>
);

describe('ExpiredPermalinkView', () => {
    const mockOnResendClick = jest.fn();
    const defaultProps = {
        onResendClick: mockOnResendClick,
    };

    beforeEach(() => {
        mockOnResendClick.mockReset();
    });

    it('renders expired message', () => {
        render(<ExpiredPermalinkView {...defaultProps} />, { wrapper: Wrapper });

        expect(screen.getByText(localeContext.language.translate('order_confirmation.expired_token.heading'))).toBeInTheDocument();
        expect(
            screen.getByText(localeContext.language.translate('order_confirmation.expired_token.description')),
        ).toBeInTheDocument();
    });

    it('renders resend button', () => {
        render(<ExpiredPermalinkView {...defaultProps} />, { wrapper: Wrapper });

        expect(
            screen.getByRole('button', { name: localeContext.language.translate('order_confirmation.expired_token.resend_action') }),
        ).toBeInTheDocument();
    });

    it('calls onResendClick when button is clicked', async () => {
        mockOnResendClick.mockResolvedValue(undefined);

        render(<ExpiredPermalinkView {...defaultProps} />, { wrapper: Wrapper });

        const button = screen.getByRole('button', { name: localeContext.language.translate('order_confirmation.expired_token.resend_action') });

        await userEvent.click(button);

        expect(mockOnResendClick).toHaveBeenCalledTimes(1);
    });

    it('shows loading state while resending', async () => {
        mockOnResendClick.mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 100)),
        );

        render(<ExpiredPermalinkView {...defaultProps} />, { wrapper: Wrapper });

        const button = screen.getByRole('button', { name: localeContext.language.translate('order_confirmation.expired_token.resend_action') });

        await userEvent.click(button);

        expect(screen.getByRole('button', { name: localeContext.language.translate('order_confirmation.expired_token.sending') })).toBeDisabled();
    });

    it('shows success message after successful resend', async () => {
        mockOnResendClick.mockResolvedValue(undefined);

        render(<ExpiredPermalinkView {...defaultProps} />, { wrapper: Wrapper });

        const button = screen.getByRole('button', { name: localeContext.language.translate('order_confirmation.expired_token.resend_action') });

        await userEvent.click(button);

        await waitFor(() => {
            expect(
                screen.getByText(localeContext.language.translate('order_confirmation.expired_token.resend_success')),
            ).toBeInTheDocument();
        });

        expect(screen.queryByRole('button', { name: localeContext.language.translate('order_confirmation.expired_token.resend_action') })).not.toBeInTheDocument();
    });

    it('shows translated error message when resend fails', async () => {
        mockOnResendClick.mockRejectedValue(new Error('any error'));

        render(<ExpiredPermalinkView {...defaultProps} />, { wrapper: Wrapper });

        const button = screen.getByRole('button', { name: localeContext.language.translate('order_confirmation.expired_token.resend_action') });

        await userEvent.click(button);

        await waitFor(() => {
            expect(
                screen.getByText(localeContext.language.translate('order_confirmation.expired_token.resend_error')),
            ).toBeInTheDocument();
        });
    });
});
