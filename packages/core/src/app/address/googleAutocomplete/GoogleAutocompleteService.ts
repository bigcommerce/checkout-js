import getGoogleAutocompleteScriptLoader from './getGoogleAutocompleteScriptLoader';
import GoogleAutocompleteScriptLoader from './GoogleAutocompleteScriptLoader';

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
                .loadMapsSdk(this._apiKey)
                .then((googleMapsSdk) => {
                    if (!googleMapsSdk.places.AutocompleteService) {
                        throw new Error('`AutocompleteService` is undefined');
                    }

                    return new googleMapsSdk.places.AutocompleteService();
                });
        }

        return this._autocompletePromise;
    }

    getPlacesServices(): Promise<google.maps.places.PlacesService> {
        const node = document.createElement('div');

        if (!this._placesPromise) {
            this._placesPromise = this._scriptLoader
                .loadMapsSdk(this._apiKey)
                .then((googleMapsSdk) => {
                    if (!googleMapsSdk.places.PlacesService) {
                        throw new Error('`PlacesService` is undefined');
                    }

                    return new googleMapsSdk.places.PlacesService(node);
                });
        }

        return this._placesPromise;
    }
}
