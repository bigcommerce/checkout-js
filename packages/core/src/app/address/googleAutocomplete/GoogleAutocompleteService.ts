import getGoogleAutocompleteScriptLoader from './getGoogleAutocompleteScriptLoader';
import { type GoogleAutocompleteScriptLoader } from './GoogleAutocompleteScriptLoader';

export default class GoogleAutocompleteService {
    private _autocompletePromise?: Promise<google.maps.places.AutocompleteService>;
    private _placesPromise?: Promise<google.maps.places.PlacesService>;

    constructor(
        private _apiKey: string,
        private _scriptLoader: GoogleAutocompleteScriptLoader = getGoogleAutocompleteScriptLoader(),
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
