import ConsoleErrorLogger from './ConsoleErrorLogger';
import { ErrorLevelType } from './ErrorLogger';

describe('ConsoleErrorLogger', () => {
    let mockConsole: Console;

    beforeEach(() => {
        mockConsole = {
            error: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
        } as unknown as Console;
    });

    it('logs error as error to console by default', () => {
        const logger = new ConsoleErrorLogger({ console: mockConsole });
        const error = new Error('Testing 123');
        const tags = { errorCode: 'abc' };

        logger.log(error, tags);

        expect(mockConsole.error)
            .toHaveBeenCalledWith(error, tags);
    });

    it('logs error as warning to console', () => {
        const logger = new ConsoleErrorLogger({ console: mockConsole });
        const error = new Error('Testing 123');
        const tags = { errorCode: 'abc' };

        logger.log(error, tags, ErrorLevelType.Warning);

        expect(mockConsole.warn)
            .toHaveBeenCalledWith(error, tags);
    });

    it('logs error as info to console', () => {
        const logger = new ConsoleErrorLogger({ console: mockConsole });
        const error = new Error('Testing 123');
        const tags = { errorCode: 'abc' };

        logger.log(error, tags, ErrorLevelType.Info);

        expect(mockConsole.info)
            .toHaveBeenCalledWith(error, tags);
    });

    it('allows additional error types to be logged', () => {
        const logger = new ConsoleErrorLogger({
            console: mockConsole,
            errorTypes: ['Foo'],
        });

        const error = new Error('Foo');
        error.name = 'Foo';

        logger.log(error);

        expect(mockConsole.error)
            .toHaveBeenCalledWith(error, undefined);
    });

    it('does not log custom errors unless they are listed as additional error types', () => {
        const logger = new ConsoleErrorLogger({
            console: mockConsole,
            errorTypes: ['Foo'],
        });

        const error = new Error('Bar');
        error.name = 'Bar';

        logger.log(error);

        expect(mockConsole.error)
            .not.toHaveBeenCalledWith(error, undefined);
    });
});
