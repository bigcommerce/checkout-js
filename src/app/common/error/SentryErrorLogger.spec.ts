import { BrowserOptions, Exception, Hub, Scope, Severity } from '@sentry/browser';

import computeErrorCode from './computeErrorCode';
import { ErrorLevelType } from './ErrorLogger';
import SentryClientFactory from './SentryClientFactory';
import SentryErrorLogger, { DEFAULT_ERROR_TYPES } from './SentryErrorLogger';

describe('SentryErrorLogger', () => {
    let factory: SentryClientFactory;
    let config: BrowserOptions;

    beforeEach(() => {
        config = {
            dsn: 'https://abc@sentry.io/123',
        };
        factory = new SentryClientFactory();
    });

    it('configures Sentry client to only log certain error types', () => {
        jest.spyOn(factory, 'createClient');

        // tslint:disable-next-line:no-unused-expression
        new SentryErrorLogger(factory, config);

        const clientOptions: BrowserOptions = (factory.createClient as jest.Mock).mock.calls[0][0];
        const exception: Exception = { type: 'Error', value: '' };

        DEFAULT_ERROR_TYPES.forEach(type => {
            const event = { exception: { values: [{ ...exception, type }] } };

            // tslint:disable-next-line:no-non-null-assertion
            expect(clientOptions.beforeSend!(event))
                .toEqual(event);
        });

        ['Foo', 'Bar'].forEach(type => {
            const event = { exception: { values: [{ ...exception, type }] } };

            // tslint:disable-next-line:no-non-null-assertion
            expect(clientOptions.beforeSend!(event))
                .toEqual(null);
        });
    });

    it('allows additional error types to be logged', () => {
        jest.spyOn(factory, 'createClient');

        // tslint:disable-next-line:no-unused-expression
        new SentryErrorLogger(factory, config, { errorTypes: ['Foo', 'Bar'] });

        const clientOptions: BrowserOptions = (factory.createClient as jest.Mock).mock.calls[0][0];
        const exception: Exception = { type: 'Error', value: '' };

        ['Foo', 'Bar'].forEach(type => {
            const event = { exception: { values: [{ ...exception, type }] } };

            // tslint:disable-next-line:no-non-null-assertion
            expect(clientOptions.beforeSend!(event))
                .toEqual(event);
        });
    });

    describe('#log()', () => {
        let hub: Hub;
        let scope: Scope;

        beforeEach(() => {
            hub = new Hub();
            scope = new Scope();

            jest.spyOn(hub, 'captureException')
                .mockImplementation();

            jest.spyOn(scope, 'setLevel')
                .mockImplementation();

            jest.spyOn(scope, 'setTags')
                .mockImplementation();

            jest.spyOn(scope, 'setFingerprint')
                .mockImplementation();

            jest.spyOn(hub, 'withScope')
                .mockImplementation(fn => fn(scope));

            jest.spyOn(factory, 'createHub')
                .mockReturnValue(hub);
        });

        it('logs error with provided error code, level and specific fingerprint', () => {
            const logger = new SentryErrorLogger(factory, config, { errorTypes: ['Foo', 'Bar'] });
            const error = new Error();
            const tags = { errorCode: 'foo' };

            logger.log(error, tags, ErrorLevelType.Warning);

            expect(scope.setLevel)
                .toHaveBeenCalledWith(Severity.Warning);

            expect(scope.setTags)
                .toHaveBeenCalledWith(tags);

            expect(scope.setFingerprint)
                .toHaveBeenCalledWith(['{{ default }}', tags.errorCode]);

            expect(hub.captureException)
                .toHaveBeenCalledWith(error);
        });

        it('logs error with default error code, level and specific fingerprint if level / code is not provided', () => {
            const logger = new SentryErrorLogger(factory, config);
            const error = new Error();

            logger.log(error);

            expect(scope.setLevel)
                .toHaveBeenCalledWith(Severity.Error);

            expect(scope.setTags)
                .toHaveBeenCalledWith({ errorCode: computeErrorCode(error) });

            expect(scope.setFingerprint)
                .toHaveBeenCalledWith(['{{ default }}', computeErrorCode(error)]);

            expect(hub.captureException)
                .toHaveBeenCalledWith(error);
        });

        it('maps to error level enum recognized by Sentry', () => {
            const logger = new SentryErrorLogger(factory, config);
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
