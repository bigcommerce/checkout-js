import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import BackorderQuantitiesChangedBanner from './BackorderQuantitiesChangedBanner';

describe('BackorderQuantitiesChangedBanner', () => {
    const defaultMessage = 'The backorder quantities for some items have changed.';

    it('renders nothing when message is not provided', () => {
        const { container } = render(<BackorderQuantitiesChangedBanner />);

        expect(container).toBeEmptyDOMElement();
    });

    it('renders nothing when message is empty', () => {
        const { container } = render(<BackorderQuantitiesChangedBanner message="" />);

        expect(container).toBeEmptyDOMElement();
    });

    it('renders the banner with message when message is provided', () => {
        render(<BackorderQuantitiesChangedBanner message={defaultMessage} />);

        expect(screen.getByTestId('backorder-quantities-changed-banner')).toBeInTheDocument();
        expect(screen.getByText(defaultMessage)).toBeInTheDocument();
    });

    it('renders an info alert', () => {
        render(<BackorderQuantitiesChangedBanner message={defaultMessage} />);

        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('renders a close button', () => {
        render(<BackorderQuantitiesChangedBanner message={defaultMessage} />);

        expect(
            screen.getByTestId('backorder-quantities-changed-banner-close'),
        ).toBeInTheDocument();
    });

    it('dismisses the banner when close button is clicked', async () => {
        const user = userEvent.setup();
        render(<BackorderQuantitiesChangedBanner message={defaultMessage} />);

        expect(screen.getByTestId('backorder-quantities-changed-banner')).toBeInTheDocument();

        await user.click(screen.getByTestId('backorder-quantities-changed-banner-close'));

        expect(screen.queryByTestId('backorder-quantities-changed-banner')).not.toBeInTheDocument();
    });
});
