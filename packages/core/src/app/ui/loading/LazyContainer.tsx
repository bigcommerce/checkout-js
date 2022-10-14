import React, { FunctionComponent, ReactNode, Suspense } from 'react';

import { ErrorBoundary } from '../../common/error';
import { TranslatedString } from '../../locale';

import './LazyContainer.scss';
import LoadingSpinner from './LoadingSpinner';

export interface LazyContainerProps {
    children: ReactNode;
    loadingSkeleton?: ReactNode;
}

const filterError = (error: Error) => error.name === 'ChunkLoadError';

const LazyContainer: FunctionComponent<LazyContainerProps> = ({ loadingSkeleton, children }) => (
    <ErrorBoundary
        fallback={
            <div className="lazyContainer-error">
                <TranslatedString id="common.unstable_network_error" />
            </div>
        }
        filter={filterError}
    >
        <Suspense fallback={loadingSkeleton || <LoadingSpinner isLoading />}>{children}</Suspense>
    </ErrorBoundary>
);

export default LazyContainer;
