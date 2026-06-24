import type { AutocompleteItem } from '@bigcommerce/checkout/ui';

import getGoogleAutocompleteScriptLoader from './getGoogleAutocompleteScriptLoader';
import type GoogleAutocompleteScriptLoader from './GoogleAutocompleteScriptLoader';
import type { IGoogleAutocompleteService } from './IGoogleAutocompleteService';

const toAutocompleteItems = (
    results?: google.maps.places.AutocompletePrediction[],
): AutocompleteItem[] =>
    (results || []).map((result) => ({
        label: result.description,
        value: result.structured_formatting.main_text,
        highlightedSlices: result.matched_substrings,
        id: result.place_id,
    }));

export default class GoogleAutocompleteService implements IGoogleAutocompleteService {
    private _autocompletePromise?: Promise<google.maps.places.AutocompleteService>;
    private _placesPromise?: Promise<google.maps.places.PlacesService>;

    constructor(
        private _apiKey: string,
        private _scriptLoader: GoogleAutocompleteScriptLoader = getGoogleAutocompleteScriptLoader(),
    ) {}

    getSuggestions(
        input: string,
        types: string[] | undefined,
        componentRestrictions?: google.maps.places.ComponentRestrictions,
    ): Promise<AutocompleteItem[]> {
        return this.getAutocompleteService().then(
            (autocompleteService) =>
                new Promise((resolve) => {
                    autocompleteService.getPlacePredictions(
                        { input, types: types || ['geocode'], componentRestrictions },
                        (results) => resolve(toAutocompleteItems(results ?? undefined)),
                    );
                }),
        );
    }

    getPlaceDetails(
        placeId: string,
        fields?: string[],
    ): Promise<google.maps.places.PlaceResult> {
        return this.getPlacesServices().then(
            (placesService) =>
                new Promise((resolve) => {
                    placesService.getDetails(
                        {
                            placeId,
                            fields: fields?.length ? fields : ['address_components', 'name'],
                        },
                        (result) => resolve(result ?? {}),
                    );
                }),
        );
    }

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
