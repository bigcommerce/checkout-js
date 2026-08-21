import React, { type FunctionComponent } from 'react';

import { render, screen } from '@bigcommerce/checkout/test-utils';

import ErrorBoundary from './ErrorBoundary';
import type ErrorLogger from './ErrorLogger';

describe('ErrorBoundary', () => {
    beforeEach(() => {
        // Need to mock `console.error` because React calls it deliberately
        jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
        jest.spyOn(console, 'error').mockRestore();
    });

    it('logs error if logger is provided', () => {
        const error = new Error();
        const logger: ErrorLogger = {
            log: jest.fn(),
        };
        const Child: FunctionComponent = () => {
            throw error;
        };

        render(
            <ErrorBoundary errorLogger={logger}>
                <Child />
            </ErrorBoundary>,
        );

        expect(logger.log).toHaveBeenCalledWith(error, { errorCode: 'ErrorBoundary' });
    });

    it('does not log error if filter returns false', () => {
        const error = new Error();
        const logger: ErrorLogger = {
            log: jest.fn(),
        };
        const Child: FunctionComponent = () => {
            throw error;
        };
        const filterError = ({ name }: Error) => name === 'TypeError';

        expect(() =>
            render(
                <ErrorBoundary errorLogger={logger} filter={filterError}>
                    <Child />
                </ErrorBoundary>,
            ),
        ).toThrow(error);
        expect(logger.log).not.toHaveBeenCalledWith(error);
    });

    it('calls onError if provided', () => {
        const error = new Error();
        const onError = jest.fn();
        const Child: FunctionComponent = () => {
            throw error;
        };

        render(
            <ErrorBoundary onError={onError}>
                <Child />
            </ErrorBoundary>,
        );

        expect(onError).toHaveBeenCalledWith(error);
    });

    it('does not call onError if filter returns false', () => {
        const error = new Error();
        const onError = jest.fn();
        const Child: FunctionComponent = () => {
            throw error;
        };
        const filterError = ({ name }: Error) => name === 'TypeError';

        expect(() =>
            render(
                <ErrorBoundary filter={filterError} onError={onError}>
                    <Child />
                </ErrorBoundary>,
            ),
        ).toThrow(error);
        expect(onError).not.toHaveBeenCalled();
    });

    it('renders fallback component if provided', () => {
        const Child: FunctionComponent = () => {
            throw new Error();
        };

        render(
            <ErrorBoundary fallback={<strong>Something went wrong</strong>}>
                <Child />
            </ErrorBoundary>,
        );

        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('does not render fallback component if filter returns false', () => {
        const error = new Error();
        const Child: FunctionComponent = () => {
            throw error;
        };
        const filterError = ({ name }: Error) => name === 'TypeError';

        expect(() =>
            render(
                <ErrorBoundary
                    fallback={<strong>Something went wrong</strong>}
                    filter={filterError}
                >
                    <Child />
                </ErrorBoundary>,
            ),
        ).toThrow(error);
    });
});
