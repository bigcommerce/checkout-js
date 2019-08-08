import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

// https://github.com/FezVrasta/popper.js/issues/478
if (global.document) {
    document.createRange = () => ({
        setStart: () => {},
        setEnd: () => {},
        commonAncestorContainer: {
            nodeName: 'BODY',
            ownerDocument: document,
        },
    });
}

beforeAll(() => {
    expect.hasAssertions();
});
