import createErrorLogger from './createErrorLogger';
import NoopErrorLogger from './NoopErrorLogger';
import SentryErrorLogger from './SentryErrorLogger';

describe('createErrorLogger()', () => {
    it('returns instance of noop logger', () => {
        expect(createErrorLogger()).toBeInstanceOf(NoopErrorLogger);
    });

    it('returns instance of Sentry logger if Sentry config is provided', () => {
        expect(
            createErrorLogger({
                sentry: {
                    dsn: 'https://abc@sentry.io/123',
                },
            }),
        ).toBeInstanceOf(SentryErrorLogger);
    });
});
