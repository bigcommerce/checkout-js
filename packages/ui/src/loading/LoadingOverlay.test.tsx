import React from 'react';
import '@testing-library/jest-dom';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import LoadingOverlay from './LoadingOverlay';
import { LoadingSkeletonContext } from './LoadingSkeletonContext';

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

    it('renders the skeleton provided via LoadingSkeletonContext instead of the spinner when hiding content', () => {
        render(
            <LoadingSkeletonContext.Provider value={<div data-test="context-skeleton" />}>
                <LoadingOverlay hideContentWhenLoading={true} isLoading={true}>
                    <div>Content</div>
                </LoadingOverlay>
            </LoadingSkeletonContext.Provider>,
        );

        expect(screen.getByTestId('context-skeleton')).toBeInTheDocument();
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
        expect(screen.getByText('Content')).not.toBeVisible();
    });

    it('prefers the loadingSkeleton prop over the LoadingSkeletonContext skeleton', () => {
        render(
            <LoadingSkeletonContext.Provider value={<div data-test="context-skeleton" />}>
                <LoadingOverlay
                    hideContentWhenLoading={true}
                    isLoading={true}
                    loadingSkeleton={<div data-test="prop-skeleton" />}
                >
                    <div>Content</div>
                </LoadingOverlay>
            </LoadingSkeletonContext.Provider>,
        );

        expect(screen.getByTestId('prop-skeleton')).toBeInTheDocument();
        expect(screen.queryByTestId('context-skeleton')).not.toBeInTheDocument();
    });

    it('does not use the LoadingSkeletonContext skeleton for the overlay variant', () => {
        render(
            <LoadingSkeletonContext.Provider value={<div data-test="context-skeleton" />}>
                <LoadingOverlay isLoading={true}>
                    <div>Content</div>
                </LoadingOverlay>
            </LoadingSkeletonContext.Provider>,
        );

        expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
        expect(screen.queryByTestId('context-skeleton')).not.toBeInTheDocument();
    });
});
