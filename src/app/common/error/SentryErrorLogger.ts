import { captureException, init, withScope, BrowserOptions, Event, Severity, StackFrame } from '@sentry/browser';
import { RewriteFrames } from '@sentry/integrations';

import computeErrorCode from './computeErrorCode';
import ErrorLogger, { ErrorLevelType, ErrorLoggerOptions, ErrorTags } from './ErrorLogger';

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
    private publicPath: string;

    constructor(
        config: BrowserOptions,
        options?: Omit<ErrorLoggerOptions, 'serviceConfig'>
    ) {
        const { errorTypes = [], publicPath = '' } = options || {};

        this.errorTypes = [
            ...DEFAULT_ERROR_TYPES,
            ...errorTypes,
        ];

        this.publicPath = publicPath;

        init({
            beforeSend: this.handleBeforeSend,
            integrations: [
                new RewriteFrames({
                    iteratee: this.handleRewriteFrame,
                }),
            ],
            ...config,
        });
    }

    log(
        error: Error,
        tags?: ErrorTags,
        level: ErrorLevelType = ErrorLevelType.Error
    ): void {
        withScope(scope => {
            const { errorCode = computeErrorCode(error) } = tags || {};
            const fingerprint = ['{{ default }}', errorCode];

            scope.setLevel(this.mapToSentryLevel(level));
            scope.setTags({ errorCode });
            scope.setFingerprint(fingerprint);

            captureException(error);
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

    private handleRewriteFrame: (frame: StackFrame) => StackFrame = frame => {
        if (this.publicPath && frame.filename) {
            // We want to remove the base path of the filename, otherwise we
            // will need to specify it when we upload the sourcemaps so that the
            // filenames can match up.
            const filename = frame.filename.replace(new RegExp(`^${this.publicPath}\/?`), '');

            // `frame` needs to be modified in-place (based on the example in
            // their documentation).
            if (filename !== frame.filename) {
                frame.filename = `app:///${filename}`;
            }
        }

        return frame;
    };
}
