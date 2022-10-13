import React, { FunctionComponent, ReactNode } from 'react';

interface ChecklistSkeletonProps {
    children?: ReactNode;
    isLoading?: boolean;
    rows?: number;
}

const ChecklistSkeleton: FunctionComponent<ChecklistSkeletonProps> = ({
    children,
    isLoading,
    rows = 3,
}) => {
    if (isLoading) {
        const content = [];

        for (let i = 0; i < rows; i++) {
            content.push(
                <ul>
                    <div className="checklist-skeleton-circle" />
                    <div className="checklist-skeleton-rectangle" />
                </ul>,
            );
        }

        return <div className="checklist-skeleton">{content}</div>;
    }

    return <div>{children}</div>;
};

export default ChecklistSkeleton;
