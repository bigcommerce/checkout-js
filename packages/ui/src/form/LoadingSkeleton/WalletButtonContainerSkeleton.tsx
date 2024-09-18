import React, { FunctionComponent } from 'react';

import { LoadingSkeleton, LoadingSkeletonProps } from './LoadingSkeleton';

interface WalletButtonsProps {
    buttonsCount: number;
}

const WalletButtonContainerSkeleton: FunctionComponent<
    LoadingSkeletonProps & WalletButtonsProps
> = ({ buttonsCount, children, isLoading }) => {
    const renderWhileLoading = true;
    const skeleton = (
        <div className="checkoutRemote customer-skeleton">
            {Array(buttonsCount)
                .fill(0)
                .map((_v, i) => (
                    <div className="skeleton-container" key={`skeleton-container-${i}`}>
                        <div className="input-skeleton" />
                    </div>
                ))}
        </div>
    );

    return <LoadingSkeleton {...{ children, isLoading, renderWhileLoading, skeleton }} />;
};

export default WalletButtonContainerSkeleton;
