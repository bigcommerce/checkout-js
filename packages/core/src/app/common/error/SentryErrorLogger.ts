import {
    BrowserOptions,
    captureException,
    Event,
    init,
    Integrations,
    SeverityLevel,
    StackFrame,
    withScope,
} from '@sentry/browser';
import { RewriteFrames } from '@sentry/integrations';
import { EventHint, Exception } from '@sentry/types';

import {
    ErrorLevelType,
    ErrorLogger,
    ErrorMeta,
    ErrorTags,
} from '@bigcommerce/checkout/error-handling-utils';

import computeErrorCode from './computeErrorCode';
import ConsoleErrorLogger from './ConsoleErrorLogger';
import NoopErrorLogger from './NoopErrorLogger';

const FILENAME_PREFIX = 'app://';

export interface SentryErrorLoggerOptions {
    consoleLogger?: ConsoleErrorLogger;
    errorTypes?: string[];
    publicPath?: string;
    sampleRate?: number;
}

export enum SeverityLevelEnum {
    DEBUG = 'debug',
    ERROR = 'error',
    INFO = 'info',
    WARNING = 'warning',
}

export default class SentryErrorLogger implements ErrorLogger {
    private consoleLogger: ErrorLogger;
    private publicPath: string;

    constructor(config: BrowserOptions, options?: SentryErrorLoggerOptions) {
        const {
            consoleLogger = new NoopErrorLogger(),
            publicPath = '',
            sampleRate = 0.1,
        } = options || {};

        this.consoleLogger = consoleLogger;
        this.publicPath = publicPath;

        init({
            sampleRate,
            beforeSend: this.handleBeforeSend,
            denyUrls: [
                ...(config.denyUrls || []),
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
        level: ErrorLevelType = ErrorLevelType.Error,
        payload?: ErrorMeta,
    ): void {
        this.consoleLogger.log(error, tags, level);

        withScope((scope) => {
            const { errorCode = computeErrorCode(error) } = tags || {};

            if (errorCode) {
                scope.setTags({ errorCode });
            }

            scope.setLevel(this.mapToSentryLevel(level));

            if (payload) {
                scope.setExtras(payload);
            }

            scope.setFingerprint(['{{ default }}']);

            captureException(error);
        });
    }

    private mapToSentryLevel(level: ErrorLevelType): SeverityLevel {
        switch (level) {
            case ErrorLevelType.Info:
                return SeverityLevelEnum.INFO;

            case ErrorLevelType.Warning:
                return SeverityLevelEnum.WARNING;

            case ErrorLevelType.Debug:
                return SeverityLevelEnum.DEBUG;

            case ErrorLevelType.Error:
            default:
                return SeverityLevelEnum.ERROR;
        }
    }

    /**
     * Ignore exceptions that don't have a stacktrace at all, or have a stacktrace that references files external to
     * this app. For example, if the exception is caused by a piece of third party code, one of the frames in the
     * stacktrace will reference a file that is not a part of the app. This behaviour is different to the whitelist
     * config provided by Sentry, as the latter only examines the topmost frame in the stacktrace. The config is not
     * sufficient for us because some stores have customisation code built on top of our code, resulting in a stacktrace
     * whose topmost frame is ours but frames below it are not.
     */
    private shouldReportExceptions(exceptions: Exception[], originalException: unknown): boolean {
        // Ignore exceptions that are not an instance of Error because they are most likely not thrown by our own code,
        // as we have a lint rule that prevents us from doing so. Although these exceptions don't actually have a
        // stacktrace, meaning that the condition below should theoretically cover the scenario, but we still need this
        // condition because Sentry client creates a "synthentic" stacktrace for them using the information it has.
        if (!exceptions.length || !(originalException instanceof Error)) {
            return false;
        }

        return exceptions.every((exception) => {
            if (!exception.stacktrace?.frames?.length) {
                return false;
            }

            return exception.stacktrace.frames.every((frame) =>
                frame.filename?.startsWith(FILENAME_PREFIX),
            );
        });
    }

    private handleBeforeSend: (event: Event, hint?: EventHint) => Event | null = (event, hint) => {
        if (event.exception) {
            if (
                !this.shouldReportExceptions(
                    event.exception.values ?? [],
                    hint?.originalException ?? null,
                )
            ) {
                return null;
            }

            return event;
        }

        return event;
    };

    private handleRewriteFrame: (frame: StackFrame) => StackFrame = (frame) => {
        if (this.publicPath && frame.filename) {
            // We want to remove the base path of the filename, otherwise we
            // will need to specify it when we upload the sourcemaps so that the
            // filenames can match up.
            const filename = frame.filename.replace(new RegExp(`^${this.publicPath}/?`), '');

            // `frame` needs to be modified in-place (based on the example in
            // their documentation).
            if (filename !== frame.filename) {
                frame.filename = `${FILENAME_PREFIX}/${filename}`;
            }
        }

        return frame;
    };
}
