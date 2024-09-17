import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import { configure as configureRTL } from '@testing-library/react';
import * as Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { configure } from 'enzyme';
import { noop } from 'lodash';

const adapter = Adapter as any;

configure({ adapter: new adapter.default() });
configureRTL({ testIdAttribute: 'data-test' });

// https://github.com/facebook/jest/issues/10784
process.on('unhandledRejection', (reason) => {
    console.log(reason);
});

// https://github.com/FezVrasta/popper.js/issues/478
if (window.document) {
    document.createRange = () =>
        ({
            setStart: noop,
            setEnd: noop,
            commonAncestorContainer: {
                nodeName: 'BODY',
                ownerDocument: document,
            },
        } as Range);
}

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
