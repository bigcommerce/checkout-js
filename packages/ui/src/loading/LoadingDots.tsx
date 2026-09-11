import React, { type FunctionComponent, memo } from 'react';

const LoadingDotsComponent: FunctionComponent = () => (
    <span aria-hidden="true" className="loadingDots" data-test="loading-dots">
        <span className="loadingDots-dot">&bull;</span>
        <span className="loadingDots-dot">&bull;</span>
        <span className="loadingDots-dot">&bull;</span>
    </span>
);

export const LoadingDots = memo(LoadingDotsComponent);
