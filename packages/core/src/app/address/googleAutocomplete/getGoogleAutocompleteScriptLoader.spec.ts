import { getScriptLoader, ScriptLoader } from '@bigcommerce/script-loader';

import GoogleAutocompleteScriptLoader, {
    GoogleCallbackWindow,
} from './GoogleAutocompleteScriptLoader';
import { GoogleAutocompleteWindow } from './googleAutocompleteTypes';

describe('GoogleAutocompleteScriptLoader', () => {
    const scriptLoader: ScriptLoader = getScriptLoader();
    let googleScriptLoader: GoogleAutocompleteScriptLoader;

    describe('#loadMapsSdk()', () => {
        let spiedLoadScript: any;

        beforeEach(async () => {
            spiedLoadScript = jest.spyOn(scriptLoader, 'loadScript');

            spiedLoadScript.mockImplementation(() => {
                (window as GoogleAutocompleteWindow).google = {
                    maps: {
                        places: {},
                    } as any,
                };

                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                (window as GoogleCallbackWindow).initAutoComplete!();
            });

            googleScriptLoader = new GoogleAutocompleteScriptLoader();
            await googleScriptLoader.loadMapsSdk('foo');
        });

        afterEach(() => {
            spiedLoadScript.mockReset();
        });

        it('calls loadScript with the right parameters', () => {
            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                [
                    '//maps.googleapis.com/maps/api/js?language=en',
                    'key=foo',
                    'libraries=places',
                    'callback=initAutoComplete',
                ].join('&'),
            );
        });

        it('calls loadScript once', async () => {
            await googleScriptLoader.loadMapsSdk('x');
            await googleScriptLoader.loadMapsSdk('y');
            await googleScriptLoader.loadMapsSdk('z');

            expect(scriptLoader.loadScript).toHaveBeenCalledTimes(1);
        });
    });
});
