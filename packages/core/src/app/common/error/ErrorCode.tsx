import React, { FunctionComponent, memo, ReactNode } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import './ErrorCode.scss';

export interface ErrorCodeProps {
    code: string;
    label?: ReactNode;
}

const ErrorCode: FunctionComponent<ErrorCodeProps> = ({ code, label }) => {
    return (
        <div className="errorCode">
            <span className="errorCode-label">
                {label ?? <TranslatedString id="common.error_code" />}
            </span>{' '}
            <span className="errorCode-value">{code}</span>
        </div>
    );
};

export default memo(ErrorCode);
