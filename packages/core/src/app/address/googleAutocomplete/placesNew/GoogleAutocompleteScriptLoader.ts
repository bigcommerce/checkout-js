import { getScriptLoader, type ScriptLoader } from '@bigcommerce/script-loader';

export class GoogleAutocompleteScriptLoader {
    private _scriptLoader: ScriptLoader = getScriptLoader();
    private _placesPromise?: Promise<google.maps.PlacesLibrary>;

    loadPlacesLibrary(apiKey: string): Promise<google.maps.PlacesLibrary> {
        if (this._placesPromise) {
            return this._placesPromise;
        }

        const params = ['language=en', `key=${apiKey}`, 'loading=async'].join('&');

        const promise = this._scriptLoader
            .loadScript(`//maps.googleapis.com/maps/api/js?${params}`)
            .then(() => google.maps.importLibrary('places') as Promise<google.maps.PlacesLibrary>)
            .catch((e) => {
                this._placesPromise = undefined;
                throw e;
            });

        this._placesPromise = promise;

        return promise;
    }
}
