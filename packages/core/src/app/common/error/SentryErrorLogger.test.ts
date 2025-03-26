import {
    BrowserOptions,
    captureException,
    init,
    Integrations,
    Scope,
    withScope,
} from '@sentry/browser';
import { RewriteFrames } from '@sentry/integrations';
import { Integration } from '@sentry/types';

import { ErrorLevelType } from '@bigcommerce/checkout/error-handling-utils';

import computeErrorCode from './computeErrorCode';
import ConsoleErrorLogger from './ConsoleErrorLogger';
import SentryErrorLogger, { SeverityLevelEnum } from './SentryErrorLogger';

jest.mock('@sentry/browser', () => {
    return {
        captureException: jest.fn(),
        init: jest.fn(),
        withScope: jest.fn(),
        Integrations: {
            GlobalHandlers: jest.fn(),
        },
        Severity: {
            Error: 'Error',
            Warning: 'Warning',
        },
    };
});

describe('SentryErrorLogger', () => {
    let config: BrowserOptions;

    beforeEach(() => {
        config = {
            sampleRate: 0.123,
            dsn: 'https://abc@sentry.io/123',
        };

        (captureException as jest.Mock).mockClear();
        (init as jest.Mock).mockClear();
        (withScope as jest.Mock).mockClear();
    });

    it('does not log exception event if it is not raised by error', () => {
        new SentryErrorLogger(config);

        const clientOptions: BrowserOptions = (init as jest.Mock).mock.calls[0][0];
        const event = {
            exception: {
                values: [
                    {
                        stacktrace: { frames: [{ filename: 'js/app-123.js' }] },
                        type: 'Error',
                        value: 'Unexpected error',
                    },
                ],
            },
        };
        const hint = { originalException: 'Unexpected error' };

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(clientOptions.beforeSend!(event, hint)).toBeNull();
        expect(clientOptions.sampleRate).toBe(0.123);
    });

    it('does not log exception event if it does not contain stacktrace', () => {
        new SentryErrorLogger(config);

        const clientOptions: BrowserOptions = (init as jest.Mock).mock.calls[0][0];
        const event = {
            exception: { values: [{ type: 'Error', value: 'Unexpected error' }] },
        };
        const hint = { originalException: new Error('Unexpected error') };

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(clientOptions.beforeSend!(event, hint)).toBeNull();
    });

    it('does not log exception event if all frames in stacktrace are missing filename', () => {
        new SentryErrorLogger(config);

        const clientOptions: BrowserOptions = (init as jest.Mock).mock.calls[0][0];
        const event = {
            exception: {
                values: [
                    {
                        stacktrace: { frames: [{ filename: '' }] },
                        type: 'Error',
                        value: 'Unexpected error',
                    },
                ],
            },
        };
        const hint = { originalException: new Error('Unexpected error') };

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(clientOptions.beforeSend!(event, hint)).toBeNull();
    });

    it('logs exception event if all frames in stacktrace reference app file', () => {
        new SentryErrorLogger(config);

        const clientOptions: BrowserOptions = (init as jest.Mock).mock.calls[0][0];
        const event = {
            exception: {
                values: [
                    {
                        stacktrace: {
                            frames: [
                                { filename: 'app:///js/app-123.js' },
                                { filename: 'app:///js/app-456.js' },
                            ],
                        },
                        type: 'Error',
                        value: 'Unexpected error',
                    },
                ],
            },
        };
        const hint = { originalException: new Error('Unexpected error') };

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(clientOptions.beforeSend!(event, hint)).toEqual(event);
    });

    it('configures client to rewrite filename of error frames', () => {
        new SentryErrorLogger(config, { publicPath: 'https://cdn.foo.bar' });

        const clientOptions: BrowserOptions = (init as jest.Mock).mock.calls[0][0];

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const rewriteFrames = (clientOptions.integrations! as Integration[]).find(
            (integration) => integration.name === 'RewriteFrames',
        ) as RewriteFrames;

        const output = rewriteFrames.process({
            exception: {
                values: [
                    {
                        stacktrace: {
                            frames: [
                                {
                                    colno: 1234,
                                    filename: 'https://cdn.foo.bar/js/app-123.js',
                                    function: 't.<anonymous>',
                                    in_app: true,
                                    lineno: 1,
                                },
                            ],
                        },
                    },
                ],
            },
        });

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const frame = output.exception!.values![0].stacktrace!.frames![0];

        expect(frame).toEqual({
            ...frame,
            filename: 'app:///js/app-123.js',
        });
    });

    it('configures client to ignore errors from polyfill and Sentry client', () => {
        new SentryErrorLogger(config);

        expect(init).toHaveBeenCalledWith(
            expect.objectContaining({
                denyUrls: ['polyfill~checkout', 'sentry~checkout'],
            }),
        );
    });

    it('does not rewrite filename of error frames if it does not match with public path', () => {
        new SentryErrorLogger(config, { publicPath: 'https://cdn.foo.bar' });

        const clientOptions: BrowserOptions = (init as jest.Mock).mock.calls[0][0];

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const rewriteFrames = (clientOptions.integrations! as Integration[]).find(
            (integration) => integration.name === 'RewriteFrames',
        ) as RewriteFrames;

        const output = rewriteFrames.process({
            exception: {
                values: [
                    {
                        stacktrace: {
                            frames: [
                                {
                                    colno: 1234,
                                    filename: 'https://cdn.hello.world/js/app-123.js',
                                    function: 't.<anonymous>',
                                    in_app: true,
                                    lineno: 1,
                                },
                            ],
                        },
                    },
                ],
            },
        });

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const frame = output.exception!.values![0].stacktrace!.frames![0];

        expect(frame).toEqual({
            ...frame,
            filename: 'https://cdn.hello.world/js/app-123.js',
        });
    });

    it('disables global error handler', () => {
        new SentryErrorLogger(config);

        expect(Integrations.GlobalHandlers).toHaveBeenCalledWith({
            onerror: false,
            onunhandledrejection: true,
        });
    });

    describe('#log()', () => {
        let scope: Partial<Scope>;

        beforeEach(() => {
            scope = {
                setLevel: jest.fn(),
                setTags: jest.fn(),
                setFingerprint: jest.fn(),
            };

            (withScope as jest.Mock).mockImplementation((fn) => fn(scope));
        });

        it('logs error with provided error code, level and default fingerprint', () => {
            const logger = new SentryErrorLogger(config, { errorTypes: ['Foo', 'Bar'] });
            const error = new Error();
            const tags = { errorCode: 'foo' };

            logger.log(error, tags, ErrorLevelType.Warning);

            expect(scope.setLevel).toHaveBeenCalledWith('warning');

            expect(scope.setTags).toHaveBeenCalledWith(tags);

            expect(scope.setFingerprint).toHaveBeenCalledWith(['{{ default }}']);

            expect(captureException).toHaveBeenCalledWith(error);
        });

        it('logs error with default error code, level and specific fingerprint if level / code is not provided', () => {
            const logger = new SentryErrorLogger(config);
            const error = new Error();

            logger.log(error);

            expect(scope.setLevel).toHaveBeenCalledWith('error');

            expect(scope.setTags).toHaveBeenCalledWith({ errorCode: computeErrorCode(error) });

            expect(scope.setFingerprint).toHaveBeenCalledWith(['{{ default }}']);

            expect(captureException).toHaveBeenCalledWith(error);
        });

        it('maps to error level enum recognized by Sentry', () => {
            const logger = new SentryErrorLogger(config);
            const error = new Error();

            logger.log(error, undefined, ErrorLevelType.Error);
            logger.log(error, undefined, ErrorLevelType.Warning);
            logger.log(error, undefined, ErrorLevelType.Info);

            expect(scope.setLevel).toHaveBeenNthCalledWith(1, SeverityLevelEnum.ERROR);

            expect(scope.setLevel).toHaveBeenNthCalledWith(2, SeverityLevelEnum.WARNING);

            expect(scope.setLevel).toHaveBeenNthCalledWith(3, SeverityLevelEnum.INFO);
        });

        it('logs error in console if console logger is provided', () => {
            const consoleLogger = new ConsoleErrorLogger();

            jest.spyOn(consoleLogger, 'log').mockImplementation();

            const logger = new SentryErrorLogger(config, { consoleLogger });
            const error = new Error('Testing 123');
            const tags = { errorCode: 'abc' };
            const level = ErrorLevelType.Error;

            logger.log(error, tags, level);

            expect(consoleLogger.log).toHaveBeenCalledWith(error, tags, level);
        });
    });
});
