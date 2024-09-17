import React, { FunctionComponent, memo } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

export interface LoadingNotificationProps {
    isLoading: boolean;
}

const LoadingNotification: FunctionComponent<LoadingNotificationProps> = ({ isLoading }) => {
    if (!isLoading) {
        return null;
    }

    return (
        <div className="loadingNotification">
            <div className="loadingNotification-label optimizedCheckout-loadingToaster">
                <div className="spinner" />

                <span aria-live="assertive" className="label" role="alert">
                    <TranslatedString id="common.loading_text" />
                </span>
            </div>
        </div>
    );
};

export default memo(LoadingNotification);
