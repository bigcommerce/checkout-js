import configurePublicPath from './configurePublicPath';

// `document.currentScript` is a readonly property that can only be read at the
// top level (outside of any function). Therefore, I need this workaround in
// order to mock it.
jest.mock('./getCurrentScriptPath', () => () => 'https://helloworld.com/assets/app.js');

describe('configurePublicPath()', () => {
    const initialValue = (global as any).__webpack_public_path__;

    afterEach(() => {
        (global as any).__webpack_public_path__ = initialValue;
    });

    it('sets public path for Webpack if path is provided', () => {
        configurePublicPath('https://foobar.com/assets/');

        expect((global as any).__webpack_public_path__).toBe('https://foobar.com/assets/');
    });

    it('adds trailing slash if it is not included in provided path', () => {
        configurePublicPath('https://foobar.com/assets');

        expect((global as any).__webpack_public_path__).toBe('https://foobar.com/assets/');
    });

    it('sets public path for Webpack using current script path if path is not provided', () => {
        configurePublicPath();

        expect((global as any).__webpack_public_path__).toBe('https://helloworld.com/assets/');
    });
});
