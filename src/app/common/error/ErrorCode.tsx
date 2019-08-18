import React, { FunctionComponent } from 'react';

import { TranslatedString } from '../../locale';

import './ErrorCode.scss';

const ErrorCode: FunctionComponent<{code: string}> = ({ code }) => {
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
