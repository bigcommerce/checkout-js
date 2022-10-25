import React, { FunctionComponent } from 'react';

import LoadingSpinner from './LoadingSpinner';

export interface LoadingOverlayProps {
    isLoading: boolean;
    hideContentWhenLoading?: boolean;
    unmountContentWhenLoading?: boolean;
}

const LoadingOverlay: FunctionComponent<LoadingOverlayProps> = ({
    children,
    hideContentWhenLoading,
    unmountContentWhenLoading,
    isLoading,
}) => {
    if (hideContentWhenLoading || unmountContentWhenLoading) {
        return (
            <>
                <LoadingSpinner isLoading={isLoading} />
                {unmountContentWhenLoading && isLoading ? null : (
                    <div
                        style={{
                            display: hideContentWhenLoading && isLoading ? 'none' : undefined,
                        }}
                    >
                        {children}
                    </div>
                )}
            </>
        );
    }

    return (
        <div className="loadingOverlay-container">
            {children}
            {isLoading && <div className="loadingOverlay optimizedCheckout-overlay" />}
        </div>
    );
};

export default LoadingOverlay;
