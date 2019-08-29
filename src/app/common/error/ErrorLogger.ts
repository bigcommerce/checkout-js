import { BrowserOptions } from '@sentry/browser';

export default interface ErrorLogger {
    /**
     * Logs an error in, tagging it with an error code.
     *
     * @param error The error object to be logged
     * @param tags The tags attached to the log entry
     * @param level The level of the log
     */
    log(
        error: Error,
        tags?: ErrorTags,
        level?: ErrorLevelType
    ): void;
}

export interface ErrorLoggerOptions {
    errorTypes?: string[];
}

export interface ErrorLoggerServiceConfig {
    sentry?: BrowserOptions;
}

export interface ErrorTags {
    /**
     * A code that identifies uniquely each error type
     */
    errorCode: string;
}

export enum ErrorLevelType {
    Info = 'info',
    Warning = 'warning',
    Error = 'error',
}
