import { getScriptLoader, ScriptLoader } from '@bigcommerce/script-loader';
import type { BrowserOptions } from '@sentry/browser';

import { ErrorLevelType } from '@bigcommerce/checkout/error-handling-utils';

import computeErrorCode from './computeErrorCode';
import ConsoleErrorLogger from './ConsoleErrorLogger';
import SentryErrorLogger, { SeverityLevelEnum } from './SentryErrorLogger';

jest.mock('@bigcommerce/script-loader', () => ({
    getScriptLoader: jest.fn(() => ({
        loadScript: jest.fn(() => Promise.resolve()),
        loadScripts: jest.fn(() => Promise.resolve()),
        preloadScript: jest.fn(() => Promise.resolve()),
        preloadScripts: jest.fn(() => Promise.resolve()),
    })),
}));

const mockSentry = {
    init: jest.fn(),
    captureException: jest.fn(),
    globalHandlersIntegration: jest.fn(() => ({ name: 'GlobalHandlers' })),
    rewriteFramesIntegration: jest.fn(() => ({ name: 'RewriteFrames' })),
};

declare global {
    interface Window {
        Sentry?: typeof mockSentry;
    }
}

window.Sentry = mockSentry;

describe('SentryErrorLogger', () => {
    let config: BrowserOptions;
    let mockScriptLoader: Pick<ScriptLoader, 'loadScript' | 'loadScripts' | 'preloadScript' | 'preloadScripts'>;

    beforeEach(() => {
        config = {
            sampleRate: 0.123,
            dsn: 'https://abc@sentry.io/123',
        };

        mockScriptLoader = {
            loadScript: jest.fn(() => Promise.resolve()),
            loadScripts: jest.fn(() => Promise.resolve()),
            preloadScript: jest.fn(() => Promise.resolve()),
            preloadScripts: jest.fn(() => Promise.resolve()),
        };
        (getScriptLoader as jest.Mock).mockReturnValue(mockScriptLoader);

        (global as any).Sentry = mockSentry;
        window.sentryOnLoad = undefined;

        jest.clearAllMocks();
    });

    afterEach(() => {
        delete (global as any).Sentry;
        delete window.sentryOnLoad;
    });

    it('sets up sentryOnLoad callback during construction', () => {
        new SentryErrorLogger(config);

        expect(window.sentryOnLoad).toBeDefined();
        expect(typeof window.sentryOnLoad).toBe('function');
    });

    it('initializes Sentry when sentryOnLoad is called', () => {
        new SentryErrorLogger(config);

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        window.sentryOnLoad!();

        expect(mockSentry.init).toHaveBeenCalledWith(
            expect.objectContaining({
                sampleRate: 0.123,
                denyUrls: ['polyfill~checkout', 'sentry~checkout'],
                beforeSend: expect.any(Function),
                integrations: expect.arrayContaining([
                    expect.any(Object),
                    expect.any(Object),
                ]),
                dsn: 'https://abc@sentry.io/123',
            })
        );

        expect(mockSentry.globalHandlersIntegration).toHaveBeenCalledWith({
            onerror: false,
            onunhandledrejection: true,
        });

        expect(mockSentry.rewriteFramesIntegration).toHaveBeenCalledWith({
            iteratee: expect.any(Function),
        });
    });

    it('loads Sentry script from CDN with correct URL', async () => {
        const logger = new SentryErrorLogger(config);

        await logger.log(new Error('test error'));

        expect(mockScriptLoader.loadScript).toHaveBeenCalledWith(
            'https://js.sentry-cdn.com/abc.min.js',
            {
                attributes: {
                    crossorigin: 'anonymous',
                },
                async: false,
            }
        );
    });

    it('only loads Sentry script once for multiple log calls', async () => {
        const logger = new SentryErrorLogger(config);

        await logger.log(new Error('test error 1'));
        await logger.log(new Error('test error 2'));

        expect(mockScriptLoader.loadScript).toHaveBeenCalledTimes(1);
    });

    it('filters out exceptions that are not Error instances', () => {
        new SentryErrorLogger(config);

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        window.sentryOnLoad!();

        const beforeSend = mockSentry.init.mock.calls[0][0].beforeSend;
        const event = {
            type: 'error' as const,
            exception: {
                values: [
                    {
                        stacktrace: { frames: [{ filename: 'app:///test.js' }] },
                        type: 'Error',
                        value: 'test error',
                    },
                ],
            },
        };
        const hint = { originalException: 'string error' };

        expect(beforeSend(event, hint)).toBeNull();
    });

    it('filters out exceptions without stacktraces', () => {
        new SentryErrorLogger(config);

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        window.sentryOnLoad!();

        const beforeSend = mockSentry.init.mock.calls[0][0].beforeSend;
        const event = {
            type: 'error' as const,
            exception: {
                values: [
                    {
                        type: 'Error',
                        value: 'test error',
                    },
                ],
            },
        };
        const hint = { originalException: new Error('test error') };

        expect(beforeSend(event, hint)).toBeNull();
    });

    it('filters out exceptions with external file references', () => {
        new SentryErrorLogger(config);

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        window.sentryOnLoad!();

        const beforeSend = mockSentry.init.mock.calls[0][0].beforeSend;
        const event = {
            type: 'error' as const,
            exception: {
                values: [
                    {
                        stacktrace: { frames: [{ filename: 'https://external.com/script.js' }] },
                        type: 'Error',
                        value: 'test error',
                    },
                ],
            },
        };
        const hint = { originalException: new Error('test error') };

        expect(beforeSend(event, hint)).toBeNull();
    });

    it('allows exceptions with app:// file references', () => {
        new SentryErrorLogger(config);

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        window.sentryOnLoad!();

        const beforeSend = mockSentry.init.mock.calls[0][0].beforeSend;
        const event = {
            type: 'error' as const,
            exception: {
                values: [
                    {
                        stacktrace: {
                            frames: [
                                { filename: 'app:///js/app-123.js' },
                                { filename: 'app:///js/app-456.js' },
                            ]
                        },
                        type: 'Error',
                        value: 'test error',
                    },
                ],
            },
        };
        const hint = { originalException: new Error('test error') };

        expect(beforeSend(event, hint)).toEqual(event);
    });

    it('rewrites frame filenames to app:// format when publicPath matches', () => {
        new SentryErrorLogger(config, { publicPath: 'https://cdn.foo.bar' });

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        window.sentryOnLoad!();

        const rewriteCall = mockSentry.rewriteFramesIntegration.mock.calls[0];
        const iteratee = (rewriteCall as any)?.[0]?.iteratee;
        const frame = {
            filename: 'https://cdn.foo.bar/js/app-123.js',
            colno: 1234,
            function: 't.<anonymous>',
            in_app: true,
            lineno: 1,
        };

        const result = iteratee(frame);

        expect(result.filename).toBe('app:///js/app-123.js');
    });

    it('does not rewrite frame filenames when publicPath does not match', () => {
        new SentryErrorLogger(config, { publicPath: 'https://cdn.foo.bar' });

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        window.sentryOnLoad!();

        const rewriteCall = mockSentry.rewriteFramesIntegration.mock.calls[0];
        const iteratee = (rewriteCall as any)?.[0]?.iteratee;
        const originalFilename = 'https://cdn.hello.world/js/app-123.js';
        const frame = {
            filename: originalFilename,
            colno: 1234,
            function: 't.<anonymous>',
            in_app: true,
            lineno: 1,
        };

        const result = iteratee(frame);

        expect(result.filename).toBe(originalFilename);
    });

    describe('#log()', () => {
        it('logs error with provided error code, level and payload', async () => {
            const logger = new SentryErrorLogger(config);
            const error = new Error('test error');
            const tags = { errorCode: 'foo' };
            const payload = { extra: 'data' };

            await logger.log(error, tags, ErrorLevelType.Warning, payload);

            expect(mockSentry.captureException).toHaveBeenCalledWith(error, {
                tags: { errorCode: 'foo' },
                level: 'warning',
                extra: payload,
                fingerprint: ['{{ default }}'],
            });
        });

        it('logs error with computed error code when tags not provided', async () => {
            const logger = new SentryErrorLogger(config);
            const error = new Error('test error');

            await logger.log(error);

            expect(mockSentry.captureException).toHaveBeenCalledWith(error, {
                tags: { errorCode: computeErrorCode(error) },
                level: 'error',
                extra: undefined,
                fingerprint: ['{{ default }}'],
            });
        });

        it('maps error levels to Sentry severity levels', async () => {
            const logger = new SentryErrorLogger(config);
            const error = new Error('test error');

            await logger.log(error, undefined, ErrorLevelType.Error);
            await logger.log(error, undefined, ErrorLevelType.Warning);
            await logger.log(error, undefined, ErrorLevelType.Info);
            await logger.log(error, undefined, ErrorLevelType.Debug);

            expect(mockSentry.captureException).toHaveBeenNthCalledWith(1, error, expect.objectContaining({
                level: SeverityLevelEnum.ERROR,
            }));
            expect(mockSentry.captureException).toHaveBeenNthCalledWith(2, error, expect.objectContaining({
                level: SeverityLevelEnum.WARNING,
            }));
            expect(mockSentry.captureException).toHaveBeenNthCalledWith(3, error, expect.objectContaining({
                level: SeverityLevelEnum.INFO,
            }));
            expect(mockSentry.captureException).toHaveBeenNthCalledWith(4, error, expect.objectContaining({
                level: SeverityLevelEnum.DEBUG,
            }));
        });

        it('logs error in console if console logger is provided', async () => {
            const consoleLogger = new ConsoleErrorLogger();

            jest.spyOn(consoleLogger, 'log').mockImplementation();

            const logger = new SentryErrorLogger(config, { consoleLogger });
            const error = new Error('Testing 123');
            const tags = { errorCode: 'abc' };
            const level = ErrorLevelType.Error;

            await logger.log(error, tags, level);

            expect(consoleLogger.log).toHaveBeenCalledWith(error, tags, level);
        });
    });
});
