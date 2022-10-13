import React, { FunctionComponent, ReactNode } from 'react';

export interface LoadingSkeletonProps {
    children: ReactNode;
    isLoading: boolean;
}

export const LoadingSkeleton: FunctionComponent<LoadingSkeletonProps & { skeleton: ReactNode }> = ({
    children,
    isLoading,
    skeleton,
}) => <div>{isLoading ? skeleton : <div className="loadingSkeleton">{children}</div>}</div>;
