import { BrowserOptions, Event, Hub, Severity } from '@sentry/browser';

import computeErrorCode from './computeErrorCode';
import ErrorLogger, { ErrorLevelType, ErrorLoggerOptions, ErrorTags } from './ErrorLogger';
import SentryClientFactory from './SentryClientFactory';

export const DEFAULT_ERROR_TYPES = [
    'Error',
    'EvalError',
    'RangeError',
    'ReferenceError',
    'SyntaxError',
    'TypeError',
    'URIError',
];

export default class SentryErrorLogger implements ErrorLogger {
    private errorTypes: string[];
    private hub: Hub;

    constructor(
        clientFactory: SentryClientFactory,
        config: BrowserOptions,
        options?: Omit<ErrorLoggerOptions, 'serviceConfig'>
    ) {
        this.errorTypes = [
            ...DEFAULT_ERROR_TYPES,
            ...(options && options.errorTypes ? options.errorTypes : []),
        ];

        this.hub = clientFactory.createHub(clientFactory.createClient({
            beforeSend: this.handleBeforeSend,
            ...config,
        }));
    }

    log(
        error: Error,
        tags?: ErrorTags,
        level: ErrorLevelType = ErrorLevelType.Error
    ): void {
        this.hub.withScope(scope => {
            const { errorCode = computeErrorCode(error) } = tags || {};
            const fingerprint = ['{{ default }}', errorCode];

            scope.setLevel(this.mapToSentryLevel(level));
            scope.setTags({ errorCode });
            scope.setFingerprint(fingerprint);

            this.hub.captureException(error);
        });
    }

    private mapToSentryLevel(level: ErrorLevelType): Severity {
        switch (level) {
        case ErrorLevelType.Info:
            return Severity.Info;

        case ErrorLevelType.Warning:
            return Severity.Warning;

        case ErrorLevelType.Error:
        default:
            return Severity.Error;
        }
    }

    private handleBeforeSend: (event: Event) => Event | null = event => {
        if (event.exception && event.exception.values) {
            return event.exception.values.some(exception => exception.type && this.errorTypes.indexOf(exception.type) >= 0) ?
                event :
                null;
        }

        return event;
    };
}
