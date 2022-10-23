import React, { FunctionComponent, ReactNode } from 'react';

export interface LoadingSkeletonProps {
    isLoading?: boolean;
    skeleton?: ReactNode;
}

export const LoadingSkeleton: FunctionComponent<LoadingSkeletonProps> = ({
    children,
    isLoading = true,
    skeleton,
}) => (
    <>
        {isLoading && skeleton}
        {!isLoading && !!children && <div className="loading-skeleton">{children}</div>}
    </>
);
