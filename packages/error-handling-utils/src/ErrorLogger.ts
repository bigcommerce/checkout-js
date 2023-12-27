import { BrowserOptions } from '@sentry/browser';

export default interface ErrorLogger {
    /**
     * Logs an error in, tagging it with an error code.
     *
     * @param error The error object to be logged
     * @param tags The tags attached to the log entry
     * @param level The level of the log
     * @param meta Any extra meta data
     */
    log(error: Error, tags?: ErrorTags, level?: ErrorLevelType, meta?: ErrorMeta): void;
}

export interface ErrorLoggerOptions {
    errorTypes?: string[];
    publicPath?: string;
    sampleRate?: number;
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

export interface ErrorMeta {
    [key: string]: unknown;
}

export enum ErrorLevelType {
    Info = 'info',
    Warning = 'warning',
    Error = 'error',
    Debug = 'debug',
}
