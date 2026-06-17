import { getScriptLoader, type ScriptLoader } from '@bigcommerce/script-loader';

import { GoogleAutocompleteScriptLoader } from './GoogleAutocompleteScriptLoader';
import { type WindowWithGoogleMaps } from './googleAutocompleteTypes';

const mockPlacesLibrary = {} as google.maps.PlacesLibrary;

describe('GoogleAutocompleteScriptLoader', () => {
    const scriptLoader: ScriptLoader = getScriptLoader();
    let googleScriptLoader: GoogleAutocompleteScriptLoader;

    describe('#loadPlacesLibrary()', () => {
        let spiedLoadScript: jest.SpyInstance;

        beforeEach(async () => {
            spiedLoadScript = jest.spyOn(scriptLoader, 'loadScript');

            spiedLoadScript.mockResolvedValue(undefined);

            (window as WindowWithGoogleMaps).google = {
                maps: {
                    importLibrary: jest.fn().mockResolvedValue(mockPlacesLibrary),
                },
            };

            googleScriptLoader = new GoogleAutocompleteScriptLoader();
            await googleScriptLoader.loadPlacesLibrary('foo');
        });

        afterEach(() => {
            spiedLoadScript.mockReset();
            delete (window as WindowWithGoogleMaps).google;
        });

        it('calls loadScript with the right parameters', () => {
            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                '//maps.googleapis.com/maps/api/js?language=en&key=foo&loading=async',
            );
        });

        it('resolves with the places library', async () => {
            const result = await googleScriptLoader.loadPlacesLibrary('foo');

            expect(result).toBe(mockPlacesLibrary);
        });

        it('calls loadScript once regardless of how many times loadPlacesLibrary is called', async () => {
            await googleScriptLoader.loadPlacesLibrary('x');
            await googleScriptLoader.loadPlacesLibrary('y');
            await googleScriptLoader.loadPlacesLibrary('z');

            expect(scriptLoader.loadScript).toHaveBeenCalledTimes(1);
        });
    });
});
