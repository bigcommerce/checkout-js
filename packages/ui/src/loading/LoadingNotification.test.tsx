import React from 'react';
import '@testing-library/jest-dom';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import LoadingNotification from './LoadingNotification';

describe('LoadingNotification', () => {
    it('should render the loading notification', () => {
        const { container } = render(<LoadingNotification isLoading={true} />);

        expect(screen.getByText(/loading/i)).toBeInTheDocument();
        // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
        expect(container.querySelector('.spinner')).toBeInTheDocument();
    });

    it('should not render the loading notification if prop passed is false', () => {
        render(<LoadingNotification isLoading={false} />);

        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
});
