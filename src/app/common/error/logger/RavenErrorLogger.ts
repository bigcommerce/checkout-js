import computeErrorCode from '../errorCode/computeErrorCode';

import { RavenClient } from './raven';
import ErrorLogger, { ErrorLevelType, ErrorLoggerOptions, ErrorTags } from './ErrorLogger';

export const DEFAULT_ERROR_TYPES = [
    // Native errors
    'Error',
    'EvalError',
    'RangeError',
    'ReferenceError',
    'SyntaxError',
    'TypeError',
    'URIError',

    // Custom errors
    'UnrecoverableError',
];

export default class RavenErrorLogger implements ErrorLogger {
    constructor(
        private raven: RavenClient,
        options?: ErrorLoggerOptions
    ) {
        const acceptedTypes = [
            ...DEFAULT_ERROR_TYPES,
            ...(options && options.errorTypes ? options.errorTypes : []),
        ];

        this.raven.setShouldSendCallback(data => {
            // Only filter exception events
            if (!data.exception) {
                return true;
            }

            return data.exception.values.some(error => acceptedTypes.indexOf(error.type) >= 0);
        });
    }

    setTags(tags: ErrorTags) {
        this.raven.setTagsContext(tags);
    }

    log(
        error: Error,
        tags?: ErrorTags,
        level: ErrorLevelType = ErrorLevelType.INFO
    ): void {
        const { errorCode = computeErrorCode(error) } = tags || {};
        const fingerprint = ['{{ default }}', errorCode];

        this.raven.captureException(error, {
            level,
            tags: { errorCode },
            fingerprint,
        });
    }
}
