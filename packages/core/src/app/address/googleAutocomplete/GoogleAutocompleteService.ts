import { getNewGooglePlacesApiScriptLoader } from './newGooglePlacesApi/getNewGooglePlacesApiScriptLoader';
import type { NewGooglePlacesApiScriptLoader } from './newGooglePlacesApi/NewGooglePlacesApiScriptLoader';

export default class GoogleAutocompleteService {
    private _autocompletePromise?: Promise<google.maps.places.AutocompleteService>;
    private _placesPromise?: Promise<google.maps.places.PlacesService>;

    constructor(
        private _apiKey: string,
        // Shares the single Maps JS bootstrap with the new Places API service. Both the
        // legacy and new classes live on the same `places` library, so loading it once via
        // `importLibrary` serves both — and avoids injecting the SDK twice, which corrupts
        // its internal state.
        private _scriptLoader: NewGooglePlacesApiScriptLoader = getNewGooglePlacesApiScriptLoader(),
    ) {}

    getAutocompleteService(): Promise<google.maps.places.AutocompleteService> {
        if (!this._autocompletePromise) {
            this._autocompletePromise = this._scriptLoader
                .loadPlacesLibrary(this._apiKey)
                .then(({ AutocompleteService }) => new AutocompleteService());
        }

        return this._autocompletePromise;
    }

    getPlacesServices(): Promise<google.maps.places.PlacesService> {
        const node = document.createElement('div');

        if (!this._placesPromise) {
            this._placesPromise = this._scriptLoader
                .loadPlacesLibrary(this._apiKey)
                .then(({ PlacesService }) => new PlacesService(node));
        }

        return this._placesPromise;
    }
}
