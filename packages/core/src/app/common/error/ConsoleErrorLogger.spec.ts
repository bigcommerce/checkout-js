import { ErrorLevelType } from '@bigcommerce/checkout/error-handling-utils';

import ConsoleErrorLogger from './ConsoleErrorLogger';

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

        expect(mockConsole.error).toHaveBeenCalledWith(error, tags, undefined);
    });

    it('logs error as warning to console', () => {
        const logger = new ConsoleErrorLogger({ console: mockConsole });
        const error = new Error('Testing 123');
        const tags = { errorCode: 'abc' };

        logger.log(error, tags, ErrorLevelType.Warning);

        expect(mockConsole.warn).toHaveBeenCalledWith(error, tags, undefined);
    });

    it('logs error as info to console', () => {
        const logger = new ConsoleErrorLogger({ console: mockConsole });
        const error = new Error('Testing 123');
        const tags = { errorCode: 'abc' };

        logger.log(error, tags, ErrorLevelType.Info);

        expect(mockConsole.info).toHaveBeenCalledWith(error, tags, undefined);
    });
});
