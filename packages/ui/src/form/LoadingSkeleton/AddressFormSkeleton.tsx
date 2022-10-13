import React, { FunctionComponent } from 'react';

import { LoadingSkeleton, LoadingSkeletonProps } from './LoadingSkeleton';

const AddressFormSkeleton: FunctionComponent<LoadingSkeletonProps> = ({ children, isLoading }) => {
    const skeleton = (
        <div className="address-form-skeleton">
            <div className="name">
                <ul>
                    <div className="input-skeleton" />
                </ul>
                <ul>
                    <div className="input-skeleton" />
                </ul>
            </div>
            <ul>
                <div className="input-skeleton" />
            </ul>
        </div>
    );

    return <LoadingSkeleton {...{ children, isLoading, skeleton }} />;
};

export default AddressFormSkeleton;
