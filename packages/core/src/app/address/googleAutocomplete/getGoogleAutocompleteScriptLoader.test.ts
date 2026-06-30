import { GoogleAutocompleteScriptLoader } from './GoogleAutocompleteScriptLoader';

type MutableWindow = Record<string, any>;

describe('GoogleAutocompleteScriptLoader', () => {
    const placesLibrary = {
        AutocompleteSuggestion: {},
        AutocompleteSessionToken: {},
        Place: {},
        AutocompleteService: {},
        PlacesService: {},
    };

    afterEach(() => {
        // this only removes the google property for test isolation
        delete (window as MutableWindow).google;
        document.head
            .querySelectorAll('script[src*="maps.googleapis.com"]')
            .forEach((node) => node.remove());
    });

    describe('when importLibrary is already available', () => {
        let importLibrary: jest.Mock;

        beforeEach(() => {
            importLibrary = jest.fn().mockResolvedValue(placesLibrary);
            (window as MutableWindow).google = { maps: { importLibrary } };
        });

        it('loads the places library via the existing importLibrary without bootstrapping', async () => {
            const loader = new GoogleAutocompleteScriptLoader();

            const library = await loader.loadPlacesLibrary('foo');

            expect(importLibrary).toHaveBeenCalledWith('places');
            expect(library).toBe(placesLibrary);
            expect(document.head.querySelector('script[src*="maps.googleapis.com"]')).toBeNull();
        });

        it('memoizes the library so importLibrary is only called once', async () => {
            const loader = new GoogleAutocompleteScriptLoader();

            await loader.loadPlacesLibrary('foo');
            await loader.loadPlacesLibrary('foo');
            await loader.loadPlacesLibrary('foo');

            expect(importLibrary).toHaveBeenCalledTimes(1);
        });

        it('clears the cached promise on failure so a later call can retry', async () => {
            importLibrary
                .mockRejectedValueOnce(new Error('places unavailable'))
                .mockResolvedValueOnce(placesLibrary);

            const loader = new GoogleAutocompleteScriptLoader();

            await expect(loader.loadPlacesLibrary('foo')).rejects.toThrow('places unavailable');

            const library = await loader.loadPlacesLibrary('foo');

            expect(library).toBe(placesLibrary);
            expect(importLibrary).toHaveBeenCalledTimes(2);
        });
    });

    describe('when importLibrary is missing', () => {
        it('bootstraps the Maps JS loader so importLibrary becomes available', () => {
            const loader = new GoogleAutocompleteScriptLoader();

            // The bootstrap installs `importLibrary` synchronously; the returned promise stays
            // pending until the injected script fires its callback (never, in jsdom), so we do
            // not await it here.
            loader.loadPlacesLibrary('foo').catch(() => undefined);

            expect(typeof (window as MutableWindow).google.maps.importLibrary).toBe('function');

            const script = document.head.querySelector<HTMLScriptElement>(
                'script[src*="maps.googleapis.com"]',
            );

            expect(script).not.toBeNull();
            expect(script?.src).toContain('key=foo');
            expect(script?.src).toContain('libraries=places');
            expect(script?.src).toContain('callback=google.maps.__ib__');
        });
    });
});
