import { captureException, init, withScope, BrowserOptions, Event, Severity, StackFrame } from '@sentry/browser';
import { RewriteFrames } from '@sentry/integrations';
import { EventHint } from '@sentry/types';
import { every, includes, isEmpty } from 'lodash';

import computeErrorCode from './computeErrorCode';
import DEFAULT_ERROR_TYPES from './defaultErrorTypes';
import ConsoleErrorLogger from './ConsoleErrorLogger';
import ErrorLogger, { ErrorLevelType, ErrorTags } from './ErrorLogger';
import NoopErrorLogger from './NoopErrorLogger';

export interface SentryErrorLoggerOptions {
    consoleLogger?: ConsoleErrorLogger;
    errorTypes?: string[];
    publicPath?: string;
}

export default class SentryErrorLogger implements ErrorLogger {
    private consoleLogger: ErrorLogger;
    private errorTypes: string[];
    private publicPath: string;

    constructor(
        config: BrowserOptions,
        options?: SentryErrorLoggerOptions
    ) {
        const {
            consoleLogger = new NoopErrorLogger(),
            errorTypes = [],
            publicPath = '',
        } = options || {};

        this.errorTypes = [
            ...DEFAULT_ERROR_TYPES,
            ...errorTypes,
        ];

        this.consoleLogger = consoleLogger;
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
        this.consoleLogger.log(error, tags, level);

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

    private handleBeforeSend: (event: Event, hint?: EventHint) => Event | null = (event, hint) => {
        if (event.exception) {
            const { originalException = null } = hint || {};

            if (!originalException || typeof originalException === 'string') {
                return null;
            }

            if (every(event.exception.values, value => !value.stacktrace || isEmpty(value.stacktrace.frames))) {
                return null;
            }

            if (!includes(this.errorTypes, originalException.name)) {
                return null;
            }

            return event;
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
