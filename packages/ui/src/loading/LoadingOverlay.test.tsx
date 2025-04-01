import React from 'react';
import '@testing-library/jest-dom';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import LoadingOverlay from './LoadingOverlay';

describe('LoadingOverlay', () => {
    it('should render the loading overlay', () => {
        render(
            <LoadingOverlay isLoading={true}>
                <div>Content</div>
            </LoadingOverlay>,
        );

        expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
    });

    it('should render the loading overlay and hide the content if prop passed is true for hideContentWhenLoading', () => {
        render(
            <LoadingOverlay hideContentWhenLoading={true} isLoading={true}>
                <div>Content</div>
            </LoadingOverlay>,
        );

        expect(screen.getByText('Content')).not.toBeVisible();
    });

    it('should render the loading overlay and remove the content if prop passed is true for unmountContentWhenLoading', () => {
        render(
            <LoadingOverlay isLoading={true} unmountContentWhenLoading={true}>
                <div>Content</div>
            </LoadingOverlay>,
        );

        expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });

    it('does not render the loading overlay or remove the content if prop passed is true for unmountContentWhenLoading but false for isLoading', () => {
        render(
            <LoadingOverlay isLoading={false} unmountContentWhenLoading={true}>
                <div>Content</div>
            </LoadingOverlay>,
        );

        expect(screen.getByText('Content')).toBeVisible();
    });

    it('should not render the loading overlay if state passed is false', () => {
        render(<LoadingOverlay isLoading={false} />);

        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
    });
});
