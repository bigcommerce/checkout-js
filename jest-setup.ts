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

beforeAll(() => {
    expect.hasAssertions();
});
