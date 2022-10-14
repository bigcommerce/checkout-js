import React, { FunctionComponent, ReactNode } from 'react';

export interface LoadingSkeletonProps {
    children?: ReactNode;
    isLoading?: boolean;
}

export const LoadingSkeleton: FunctionComponent<LoadingSkeletonProps & { skeleton: ReactNode }> = ({
    children,
    isLoading = true,
    skeleton,
}) => {
    const content = children ? <div className="loadingSkeleton">{children}</div> : null;

    return <div>{isLoading ? skeleton : content}</div>;
};
