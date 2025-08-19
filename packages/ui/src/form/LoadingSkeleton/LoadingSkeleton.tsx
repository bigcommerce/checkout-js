import React, { type FunctionComponent, type ReactNode } from 'react';

export interface LoadingSkeletonProps {
    isLoading?: boolean;
    renderWhileLoading?: boolean;
    skeleton?: ReactNode;
    children?: ReactNode;
}

export const LoadingSkeleton: FunctionComponent<LoadingSkeletonProps> = ({
    children,
    isLoading = true,
    renderWhileLoading = false,
    skeleton,
}) => {
    const shouldShowChildren = renderWhileLoading || !isLoading;

    return (
        <>
            {isLoading && skeleton}
            {Boolean(children) && shouldShowChildren && (
                <div
                    className="loading-skeleton"
                    style={
                        isLoading ? { position: 'absolute', left: '0%', top: '-300%' } : undefined
                    }
                >
                    {children}
                </div>
            )}
        </>
    );
};
