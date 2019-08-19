import computeErrorCode from './computeErrorCode';
import { RavenClient, RavenException, RavenShouldSendCallback } from './raven';
import { getRavenClient } from './raven.mock';
import ErrorLogger, { ErrorLevelType, ErrorTags } from './ErrorLogger';
import RavenErrorLogger, { DEFAULT_ERROR_TYPES } from './RavenErrorLogger';

describe('RavenErrorLogger', () => {
    let ravenErrorLogger: ErrorLogger;
    let ravenMock: RavenClient;

    beforeEach(() => {
        ravenMock = getRavenClient();
        ravenErrorLogger = new RavenErrorLogger(ravenMock);
    });

    it('configures Raven client to only log certain error types', () => {
        const shouldSend: RavenShouldSendCallback = (ravenMock.setShouldSendCallback as jest.Mock).mock.calls[0][0];
        const exception: RavenException = { type: 'Error', value: '', stacktrace: '' };

        DEFAULT_ERROR_TYPES.forEach(type => {
            expect(shouldSend({ exception: { values: [{ ...exception, type }] } }))
                .toEqual(true);
        });

        ['Foo', 'Bar'].forEach(type => {
            expect(shouldSend({ exception: { values: [{ ...exception, type }] } }))
                .toEqual(false);
        });
    });

    it('allows additional error types to be logged', () => {
        ravenMock = getRavenClient();
        ravenErrorLogger = new RavenErrorLogger(ravenMock, { errorTypes: ['Foo', 'Bar'] });

        const shouldSend: RavenShouldSendCallback = (ravenMock.setShouldSendCallback as jest.Mock).mock.calls[0][0];
        const exception: RavenException = { type: 'Error', value: '', stacktrace: '' };

        ['Foo', 'Bar'].forEach(type => {
            expect(shouldSend({ exception: { values: [{ ...exception, type }] } }))
                .toEqual(true);
        });
    });

    describe('#setTags()', () => {
        it('sets tag with provided error code', () => {
            const tags = { errorCode: 'foo' };
            ravenErrorLogger.setTags(tags);

            expect(ravenMock.setTagsContext).toHaveBeenCalledWith(tags);
        });
    });

    describe('#log()', () => {
        let error: Error;

        beforeEach(() => {
            error = new Error();
        });

        describe('when level and error code are provided', () => {
            let tags: ErrorTags;

            beforeEach(() => {
                tags = { errorCode: 'foo' };

                ravenErrorLogger.log(error, tags, ErrorLevelType.WARNING);
            });

            it('logs error with provided error code, level and specific finger print', () => {
                expect(ravenMock.captureException)
                    .toHaveBeenCalledWith(error, {
                        level: ErrorLevelType.WARNING,
                        tags,
                        fingerprint: [ '{{ default }}', 'foo' ],
                    });
            });
        });

        describe('when level and error code are not provided', () => {
            beforeEach(() => {
                ravenErrorLogger.log(error);
            });

            it('logs error with computed error code, level and specific finger print', () => {
                const errorCode = computeErrorCode(error);

                expect(ravenMock.captureException)
                    .toHaveBeenCalledWith(error, {
                        level: ErrorLevelType.INFO,
                        tags: { errorCode },
                        fingerprint: ['{{ default }}', errorCode],
                    });
            });
        });
    });
});
