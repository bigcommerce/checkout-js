import { render } from '@testing-library/react';
import React from 'react';

import { CaptureMessageComponent } from './CaptureMessageComponent';

import { useCheckout } from './';

jest.mock('./', () => ({
    useCheckout: jest.fn(),
}));

describe('CaptureMessageComponent', () => {
    const mockUseCheckout = useCheckout as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('calls errorLogger.logMessage with the provided non-empty message', () => {
        const logMessage = jest.fn();
        const message = 'hello';

        mockUseCheckout.mockReturnValue({ errorLogger: { logMessage } });

        render(<CaptureMessageComponent message={message} />);

        expect(logMessage).toHaveBeenCalledTimes(1);
        expect(logMessage).toHaveBeenCalledWith(message);
    });

    it('does not call logMessage if message is an empty string', () => {
        const logMessage = jest.fn();

        mockUseCheckout.mockReturnValue({ errorLogger: { logMessage } });

        render(<CaptureMessageComponent message="" />);

        expect(logMessage).not.toHaveBeenCalled();
    });

    it('does nothing if errorLogger is not provided', () => {
        mockUseCheckout.mockReturnValue({ errorLogger: undefined });

        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

        render(<CaptureMessageComponent message="ignored" />);

        expect(consoleSpy).not.toHaveBeenCalled();

        consoleSpy.mockRestore();
    });

    it('does not log without a message change', () => {
        const logMessage1 = jest.fn();

        mockUseCheckout.mockReturnValue({ errorLogger: { logMessage: logMessage1 } });

        const { rerender } = render(<CaptureMessageComponent message="stale" />);

        expect(logMessage1).toHaveBeenCalledTimes(1);

        const logMessage2 = jest.fn();

        mockUseCheckout.mockReturnValue({ errorLogger: { logMessage: logMessage2 } });

        rerender(<CaptureMessageComponent message="stale" />);

        expect(logMessage2).not.toHaveBeenCalled();
    });
});
