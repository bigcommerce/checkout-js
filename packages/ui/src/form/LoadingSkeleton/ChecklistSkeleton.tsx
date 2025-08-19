import classNames from 'classnames';
import React, { type FunctionComponent } from 'react';

import { LoadingSkeleton, type LoadingSkeletonProps } from './LoadingSkeleton';

interface ChecklistSkeletonProps {
    additionalClassName?: string;
    rows?: number;
}

const ChecklistSkeleton: FunctionComponent<LoadingSkeletonProps & ChecklistSkeletonProps> = ({
    additionalClassName,
    children,
    isLoading = true,
    rows = 3,
}) => {
    const content = [];

    for (let i = 0; i < rows; i += 1) {
        content.push(<div key={`checklist-skeleton-item${i}`} />);
    }

    const skeleton = (
        <div className={classNames(additionalClassName, 'checklist-skeleton')}>{content}</div>
    );

    return <LoadingSkeleton {...{ children, isLoading, skeleton }} />;
};

export default ChecklistSkeleton;
