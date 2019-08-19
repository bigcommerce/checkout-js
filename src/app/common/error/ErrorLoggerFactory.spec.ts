import { RavenWindow } from './raven';
import { getRavenClient } from './raven.mock';
import ErrorLoggerFactory from './ErrorLoggerFactory';
import NoopErrorLogger from './NoopErrorLogger';
import RavenErrorLogger from './RavenErrorLogger';

describe('ErrorLoggerFactory', () => {
    let factory: ErrorLoggerFactory;

    beforeEach(() => {
        factory = new ErrorLoggerFactory();
    });

    describe('#getLogger()', () => {
        it('returns instance of noop logger', () => {
            expect(factory.getLogger()).toBeInstanceOf(NoopErrorLogger);
        });

        describe('when window.Raven is defined', () => {
            beforeEach(() => {
                (window as RavenWindow).Raven = getRavenClient();
            });

            it('returns instance of Raven logger', () => {
                expect(factory.getLogger()).toBeInstanceOf(RavenErrorLogger);
            });
        });
    });
});
