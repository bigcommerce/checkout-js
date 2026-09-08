import React, { type FunctionComponent, type ReactNode, useContext } from 'react';

import { LoadingSkeletonContext } from './LoadingSkeletonContext';
import LoadingSpinner from './LoadingSpinner';

export interface LoadingOverlayProps {
    isLoading: boolean;
    hideContentWhenLoading?: boolean;
    unmountContentWhenLoading?: boolean;
    children?: ReactNode;
    loadingSkeleton?: ReactNode;
}

const LoadingOverlay: FunctionComponent<LoadingOverlayProps> = ({
    children,
    hideContentWhenLoading,
    loadingSkeleton,
    unmountContentWhenLoading,
    isLoading,
}) => {
    const loadingSkeletonFallback = useContext(LoadingSkeletonContext);
    const loadingUI = loadingSkeleton || loadingSkeletonFallback || (
        <LoadingSpinner isLoading={true} />
    );

    if (hideContentWhenLoading || unmountContentWhenLoading) {
        return (
            <>
                {isLoading ? loadingUI : null}
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
            {isLoading && (
                <div
                    className="loadingOverlay optimizedCheckout-overlay"
                    data-test="loading-overlay"
                />
            )}
        </div>
    );
};

export default LoadingOverlay;
