import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { noop } from 'lodash';

configure({ adapter: new Adapter() });

// https://github.com/FezVrasta/popper.js/issues/478
if (window.document) {
    document.createRange = () => ({
        setStart: noop,
        setEnd: noop,
        commonAncestorContainer: {
            nodeName: 'BODY',
            ownerDocument: document,
        },
    } as Range);
}

window.matchMedia = jest.fn(() => ({
    matches: false,
    addListener: noop,
    addEventListener: noop,
    removeListener: noop,
    removeEventListener: noop,
} as MediaQueryList));

Object.defineProperty(window.navigator, "userAgent", ((value) => ({
    get() { return value; },
    set(v) { value = v; }
}))(window.navigator["userAgent"]));

(global as any).__webpack_public_path__ = undefined;

beforeAll(() => {
    expect.hasAssertions();
});
