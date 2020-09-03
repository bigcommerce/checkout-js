import { captureException, init, withScope, BrowserOptions, Event, Integrations, Severity, StackFrame } from '@sentry/browser';
import { RewriteFrames } from '@sentry/integrations';
import { EventHint, Exception } from '@sentry/types';
import { every, isEmpty, some } from 'lodash';

import computeErrorCode from './computeErrorCode';
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
    private publicPath: string;

    constructor(
        config: BrowserOptions,
        options?: SentryErrorLoggerOptions
    ) {
        const {
            consoleLogger = new NoopErrorLogger(),
            publicPath = '',
        } = options || {};

        this.consoleLogger = consoleLogger;
        this.publicPath = publicPath;

        init({
            beforeSend: this.handleBeforeSend,
            blacklistUrls: [
                ...(config.blacklistUrls || []),
                'polyfill~checkout',
                'sentry~checkout',
            ],
            integrations: [
                new Integrations.GlobalHandlers({
                    onerror: false,
                    onunhandledrejection: true,
                }),
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

            if (errorCode) {
                scope.setTags({ errorCode });
            }

            scope.setLevel(this.mapToSentryLevel(level));
            scope.setFingerprint(['{{ default }}']);

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

    private hasUsefulStacktrace(exceptions: Exception[]): boolean {
        return some(exceptions, exception => {
            if (!exception.stacktrace) {
                return false;
            }

            if (isEmpty(exception.stacktrace.frames)) {
                return false;
            }

            if (every(exception.stacktrace.frames, frame => !frame.filename)) {
                return false;
            }

            return true;
        });
    }

    private handleBeforeSend: (event: Event, hint?: EventHint) => Event | null = (event, hint) => {
        if (event.exception) {
            const { originalException = null } = hint || {};

            if (!originalException || typeof originalException === 'string') {
                return null;
            }

            if (!event.exception.values || !this.hasUsefulStacktrace(event.exception.values)) {
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
