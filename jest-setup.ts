/* eslint-disable no-console,jest/no-standalone-expect */
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import { configure as configureRTL } from '@testing-library/react';
import { noop } from 'lodash';

configureRTL({ testIdAttribute: 'data-test' });

// https://github.com/facebook/jest/issues/10784
process.on('unhandledRejection', (reason) => {
    console.log(reason);
});

window.matchMedia = jest.fn(
    () =>
        ({
            matches: false,
            addListener: noop,
            addEventListener: noop,
            removeListener: noop,
            removeEventListener: noop,
        } as MediaQueryList),
);

Object.defineProperty(
    window.navigator,
    'userAgent',
    ((value) => ({
        get() {
            return value;
        },
        set(v) {
            value = v;
        },
    }))(window.navigator.userAgent),
);

(global as any).__webpack_public_path__ = undefined;

const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
    expect.hasAssertions();

    console.error = (...args: unknown[]) => {
        const message = args.map(String).join();

        // FIXME: Remove these ignored errors once we have enabled react 18 features
        if (/Formik|createRoot|React.act|findDOMNode/.test(message)) {
            return;
        }

        originalConsoleError(...args);
    };

    console.warn = (...args: unknown[]) => {
        if (args.map(String).join().includes('Formik')) {
            return;
        }

        originalConsoleWarn(...args);
    };
});
