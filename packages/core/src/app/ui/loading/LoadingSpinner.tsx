import React, { memo, FunctionComponent } from 'react';

export interface LoadingSpinnerProps {
    isLoading: boolean;
}

const LoadingSpinner: FunctionComponent<LoadingSpinnerProps> = ({
    isLoading,
}) => {
    if (!isLoading) {
        return null;
    }

    return (
        <div
            className="loadingSpinner loadingOverlay-container"
            style={ { height: 100 } }
        >
            <div className="loadingOverlay optimizedCheckout-overlay" />
        </div>
    );
};

export default memo(LoadingSpinner);
