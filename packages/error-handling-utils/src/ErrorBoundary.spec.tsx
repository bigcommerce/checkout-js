import { mount } from 'enzyme';
import React, { FunctionComponent } from 'react';

import ErrorBoundary from './ErrorBoundary';
import ErrorLogger from './ErrorLogger';

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

        mount(
            <ErrorBoundary logger={logger}>
                <Child />
            </ErrorBoundary>,
        );

        expect(logger.log).toHaveBeenCalledWith(error);
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

        try {
            mount(
                <ErrorBoundary filter={filterError} logger={logger}>
                    <Child />
                </ErrorBoundary>,
            );
            // eslint-disable-next-line @typescript-eslint/no-shadow
        } catch (error) {
            // eslint-disable-next-line jest/no-conditional-expect
            expect(logger.log).not.toHaveBeenCalledWith(error);
        }
    });

    it('renders fallback component if provided', () => {
        const Child: FunctionComponent = () => {
            throw new Error();
        };

        const component = mount(
            <ErrorBoundary fallback={<strong>Something went wrong</strong>}>
                <Child />
            </ErrorBoundary>,
        );

        expect(component.html()).toBe('<strong>Something went wrong</strong>');
    });

    it('does not render fallback component if filter returns false', () => {
        const error = new Error();
        const Child: FunctionComponent = () => {
            throw error;
        };
        const filterError = ({ name }: Error) => name === 'TypeError';

        try {
            mount(
                <ErrorBoundary
                    fallback={<strong>Something went wrong</strong>}
                    filter={filterError}
                >
                    <Child />
                </ErrorBoundary>,
            );
        } catch (thrown) {
            // eslint-disable-next-line jest/no-conditional-expect
            expect(thrown).toEqual(error);
        }
    });
});
