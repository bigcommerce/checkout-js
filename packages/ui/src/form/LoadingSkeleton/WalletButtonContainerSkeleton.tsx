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
        <div className="checkoutRemote walletbuttons-skeleton">
            {Array(buttonsCount)
                .fill(0)
                .map((_v, i) => (
                    <div key={`skeleton-container-${i}`} />
                ))}
        </div>
    );

    return <LoadingSkeleton {...{ children, isLoading, renderWhileLoading, skeleton }} />;
};

export default WalletButtonContainerSkeleton;
