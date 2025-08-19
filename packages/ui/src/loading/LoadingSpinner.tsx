import React, { type FunctionComponent, memo } from 'react';

export interface LoadingSpinnerProps {
    isLoading: boolean;
}

const LoadingSpinner: FunctionComponent<LoadingSpinnerProps> = ({ isLoading }) => {
    if (!isLoading) {
        return null;
    }

    return (
        <div
            aria-busy="true"
            className="loadingSpinner loadingOverlay-container"
            role="status"
            style={{ height: 100 }}
        >
            <div className="loadingOverlay optimizedCheckout-overlay" />
        </div>
    );
};

export default memo(LoadingSpinner);
