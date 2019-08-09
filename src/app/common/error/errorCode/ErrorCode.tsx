import React from 'react';

import { TranslatedString } from '../../../language';

import './ErrorCode.scss';

const ErrorCode: React.SFC<{code: string}> = ({ code }) => {
    return (
        <div className="errorCode">
            <span className="errorCode-label">
                <TranslatedString id="common.error_code" />
            </span>
            {' '}
            <span className="errorCode-value">{ code }</span>
        </div>
    );
};

export default ErrorCode;
