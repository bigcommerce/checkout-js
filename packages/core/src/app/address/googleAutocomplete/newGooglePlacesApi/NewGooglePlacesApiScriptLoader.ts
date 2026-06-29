import { getScriptLoader, type ScriptLoader } from '@bigcommerce/script-loader';

export class NewGooglePlacesApiScriptLoader {
    private _scriptLoader: ScriptLoader = getScriptLoader();
    private _placesPromise?: Promise<google.maps.PlacesLibrary>;

    loadPlacesLibrary(apiKey: string): Promise<google.maps.PlacesLibrary> {
        if (this._placesPromise) {
            return this._placesPromise;
        }

        // If Maps JS is already on the page (e.g. loaded by the legacy AutocompleteService),
        // skip injecting a second script tag — loading the SDK twice corrupts its internal
        // state and causes fetchAutocompleteSuggestions to throw. Go straight to importLibrary.
        const getMapsJsReady =
            typeof google !== 'undefined' && google?.maps
                ? Promise.resolve()
                : this._scriptLoader.loadScript(
                      `//maps.googleapis.com/maps/api/js?${['language=en', `key=${apiKey}`, 'loading=async'].join('&')}`,
                  );

        this._placesPromise = getMapsJsReady
            .then(() => google.maps.importLibrary('places') as Promise<google.maps.PlacesLibrary>)
            .catch((e) => {
                this._placesPromise = undefined;
                throw e;
            });

        return this._placesPromise;
    }
}
