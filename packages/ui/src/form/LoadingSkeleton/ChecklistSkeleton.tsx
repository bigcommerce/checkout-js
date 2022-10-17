import React, { FunctionComponent } from 'react';

import { LoadingSkeleton, LoadingSkeletonProps } from './LoadingSkeleton';

interface ChecklistSkeletonProps {
    rows?: number;
}

const ChecklistSkeleton: FunctionComponent<LoadingSkeletonProps & ChecklistSkeletonProps> = ({
    children,
    isLoading = true,
    rows = 3,
}) => {
    const content = [];

    for (let i = 0; i < rows; i++) {
        content.push(
            <ul key={`checklist-skeleton-item${i}`}>
                <div className="checklist-skeleton-circle" />
                <div className="checklist-skeleton-rectangle" />
            </ul>,
        );
    }

    const skeleton = <div className="checklist-skeleton">{content}</div>;

    return <LoadingSkeleton {...{ children, isLoading, skeleton }} />;
};

export default ChecklistSkeleton;
