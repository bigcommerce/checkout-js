import { captureException, init, withScope, BrowserOptions, Scope, Severity } from '@sentry/browser';
import { RewriteFrames } from '@sentry/integrations';
import { Integration } from '@sentry/types';

import computeErrorCode from './computeErrorCode';
import { ErrorLevelType } from './ErrorLogger';
import SentryErrorLogger, { DEFAULT_ERROR_TYPES } from './SentryErrorLogger';

jest.mock('@sentry/browser', () => {
    return {
        captureException: jest.fn(),
        init: jest.fn(),
        withScope: jest.fn(),
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
            dsn: 'https://abc@sentry.io/123',
        };

        (captureException as jest.Mock).mockClear();
        (init as jest.Mock).mockClear();
        (withScope as jest.Mock).mockClear();
    });

    it('configures Sentry client to only log certain error types', () => {
        // tslint:disable-next-line:no-unused-expression
        new SentryErrorLogger(config);

        const clientOptions: BrowserOptions = (init as jest.Mock).mock.calls[0][0];

        DEFAULT_ERROR_TYPES.forEach(type => {
            const event = {
                exception: { values: [{ type, value: `${type} error message` }] },
                stacktrace: { frames: [{ filename: 'js/app-123.js' }] },
            };
            const originalException = new Error(`${type} error message`);

            originalException.name = type;

            // tslint:disable-next-line:no-non-null-assertion
            expect(clientOptions.beforeSend!(event, { originalException }))
                .toEqual(event);
        });

        ['Foo', 'Bar'].forEach(type => {
            const event = {
                exception: { values: [{ type, value: `${type} error message` }] },
                stacktrace: { frames: [{ filename: 'js/app-123.js' }] },
            };
            const originalException = new Error(`${type} error message`);

            originalException.name = type;

            // tslint:disable-next-line:no-non-null-assertion
            expect(clientOptions.beforeSend!(event, { originalException }))
                .toEqual(null);
        });
    });

    it('allows additional error types to be logged', () => {
        // tslint:disable-next-line:no-unused-expression
        new SentryErrorLogger(config, { errorTypes: ['Foo', 'Bar'] });

        const clientOptions: BrowserOptions = (init as jest.Mock).mock.calls[0][0];

        ['Foo', 'Bar'].forEach(type => {
            const event = {
                exception: { values: [{ type, value: `${type} error message` }] },
                stacktrace: { frames: [{ filename: 'js/app-123.js' }] },
            };
            const originalException = new Error(`${type} error message`);

            originalException.name = type;

            // tslint:disable-next-line:no-non-null-assertion
            expect(clientOptions.beforeSend!(event, { originalException }))
                .toEqual(event);
        });
    });

    it('does not log exception event if it is not raised by error', () => {
        // tslint:disable-next-line:no-unused-expression
        new SentryErrorLogger(config);

        const clientOptions: BrowserOptions = (init as jest.Mock).mock.calls[0][0];
        const event = {
            exception: { values: [{ type: 'Error', value: 'Unexpected error' }] },
            stacktrace: { frames: [{ filename: 'js/app-123.js' }] },
        };
        const hint = { originalException: 'Unexpected error' };

        // tslint:disable-next-line:no-non-null-assertion
        expect(clientOptions.beforeSend!(event, hint))
            .toEqual(null);
    });

    it('does not log exeception event if it does not contain stacktrace', () => {
        // tslint:disable-next-line:no-unused-expression
        new SentryErrorLogger(config);

        const clientOptions: BrowserOptions = (init as jest.Mock).mock.calls[0][0];
        const event = {
            exception: { values: [{ type: 'Error', value: 'Unexpected error' }] },
        };
        const hint = { originalException: new Error('Unexpected error') };

        // tslint:disable-next-line:no-non-null-assertion
        expect(clientOptions.beforeSend!(event, hint))
            .toEqual(null);
    });

    it('configures client to rewrite filename of error frames', () => {
        // tslint:disable-next-line:no-unused-expression
        new SentryErrorLogger(config, { publicPath: 'https://cdn.foo.bar' });

        const clientOptions: BrowserOptions = (init as jest.Mock).mock.calls[0][0];

        // tslint:disable-next-line:no-non-null-assertion
        const rewriteFrames = (clientOptions.integrations! as Integration[]).find(integration => (
            integration.name === 'RewriteFrames'
        )) as RewriteFrames;

        const output = rewriteFrames.process({
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
        });

        // tslint:disable-next-line:no-non-null-assertion
        const frame = output.stacktrace!.frames![0];

        expect(frame)
            .toEqual({
                ...frame,
                filename: 'app:///js/app-123.js',
            });
    });

    it('does not rewrite filename of error frames if it does match with public path', () => {
        // tslint:disable-next-line:no-unused-expression
        new SentryErrorLogger(config, { publicPath: 'https://cdn.foo.bar' });

        const clientOptions: BrowserOptions = (init as jest.Mock).mock.calls[0][0];

        // tslint:disable-next-line:no-non-null-assertion
        const rewriteFrames = (clientOptions.integrations! as Integration[]).find(integration => (
            integration.name === 'RewriteFrames'
        )) as RewriteFrames;

        const output = rewriteFrames.process({
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
        });

        // tslint:disable-next-line:no-non-null-assertion
        const frame = output.stacktrace!.frames![0];

        expect(frame)
            .toEqual(frame);
    });

    describe('#log()', () => {
        let scope: Partial<Scope>;

        beforeEach(() => {
            scope = {
                setLevel: jest.fn(),
                setTags: jest.fn(),
                setFingerprint: jest.fn(),
            };

            (withScope as jest.Mock).mockImplementation(fn => fn(scope));
        });

        it('logs error with provided error code, level and specific fingerprint', () => {
            const logger = new SentryErrorLogger(config, { errorTypes: ['Foo', 'Bar'] });
            const error = new Error();
            const tags = { errorCode: 'foo' };

            logger.log(error, tags, ErrorLevelType.Warning);

            expect(scope.setLevel)
                .toHaveBeenCalledWith(Severity.Warning);

            expect(scope.setTags)
                .toHaveBeenCalledWith(tags);

            expect(scope.setFingerprint)
                .toHaveBeenCalledWith(['{{ default }}', tags.errorCode]);

            expect(captureException)
                .toHaveBeenCalledWith(error);
        });

        it('logs error with default error code, level and specific fingerprint if level / code is not provided', () => {
            const logger = new SentryErrorLogger(config);
            const error = new Error();

            logger.log(error);

            expect(scope.setLevel)
                .toHaveBeenCalledWith(Severity.Error);

            expect(scope.setTags)
                .toHaveBeenCalledWith({ errorCode: computeErrorCode(error) });

            expect(scope.setFingerprint)
                .toHaveBeenCalledWith(['{{ default }}', computeErrorCode(error)]);

            expect(captureException)
                .toHaveBeenCalledWith(error);
        });

        it('maps to error level enum recognized by Sentry', () => {
            const logger = new SentryErrorLogger(config);
            const error = new Error();

            logger.log(error, undefined, ErrorLevelType.Error);
            logger.log(error, undefined, ErrorLevelType.Warning);
            logger.log(error, undefined, ErrorLevelType.Info);

            expect(scope.setLevel)
                .toHaveBeenNthCalledWith(1, Severity.Error);

            expect(scope.setLevel)
                .toHaveBeenNthCalledWith(2, Severity.Warning);

            expect(scope.setLevel)
                .toHaveBeenNthCalledWith(3, Severity.Info);
        });
    });
});
