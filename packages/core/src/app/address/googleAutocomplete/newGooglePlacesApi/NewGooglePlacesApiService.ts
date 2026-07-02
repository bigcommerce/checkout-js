import type { AutocompleteItem } from '@bigcommerce/checkout/ui';

import type { GoogleAutocompleteOptionTypes } from '../googleAutocompleteTypes';

import getNewGooglePlacesApiScriptLoader from './getNewGooglePlacesApiScriptLoader';
import { type NewGooglePlacesApiScriptLoader } from './NewGooglePlacesApiScriptLoader';
import {
    mapLegacyToNewIncludedPrimaryTypes,
    mapLegacyToNewPlaceDetailsFieldMask,
    mapNewToLegacyGeocoderAddressComponent,
    mapSuggestionsToAutocompleteItems,
} from './utils';

export class NewGooglePlacesApiService {
    private _sessionToken?: google.maps.places.AutocompleteSessionToken;
    private _predictionsById = new Map<string, google.maps.places.PlacePrediction>();

    constructor(
        private _apiKey: string,
        private _scriptLoader: NewGooglePlacesApiScriptLoader = getNewGooglePlacesApiScriptLoader(),
    ) {}

    async getSuggestions(
        input: string,
        types: GoogleAutocompleteOptionTypes[] | undefined,
        componentRestrictions?: google.maps.places.ComponentRestrictions,
    ): Promise<AutocompleteItem[]> {
        const { AutocompleteSuggestion, AutocompleteSessionToken } =
            await this._scriptLoader.loadPlacesLibrary(this._apiKey);

        if (!this._sessionToken) {
            this._sessionToken = new AutocompleteSessionToken();
        }

        const includedRegionCodes = this.convertToRegionCodes(componentRestrictions?.country);
        const includedPrimaryTypes = mapLegacyToNewIncludedPrimaryTypes(types ?? ['geocode']);

        const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input,
            includedPrimaryTypes,
            includedRegionCodes,
            sessionToken: this._sessionToken,
        });

        this.cachePredictions(suggestions);

        return mapSuggestionsToAutocompleteItems(suggestions);
    }

    async getPlaceDetails(
        placeId: string,
        fields?: string[],
    ): Promise<google.maps.places.PlaceResult> {
        const place = await this.resolvePlace(placeId);

        await place.fetchFields({ fields: mapLegacyToNewPlaceDetailsFieldMask(fields) });

        // Fetching details ends the autocomplete session and the next entry should start a new one
        this.resetSession();

        return {
            address_components: place.addressComponents?.map(
                mapNewToLegacyGeocoderAddressComponent,
            ),
            name: place.displayName ?? '',
        };
    }

    private async resolvePlace(placeId: string): Promise<google.maps.places.Place> {
        const prediction = this._predictionsById.get(placeId);

        if (prediction) {
            return prediction.toPlace();
        }

        const { Place } = await this._scriptLoader.loadPlacesLibrary(this._apiKey);

        return new Place({ id: placeId });
    }

    private cachePredictions(suggestions: google.maps.places.AutocompleteSuggestion[]): void {
        for (const { placePrediction } of suggestions) {
            if (placePrediction) {
                this._predictionsById.set(placePrediction.placeId, placePrediction);
            }
        }
    }

    private resetSession(): void {
        this._sessionToken = undefined;
        this._predictionsById.clear();
    }

    private convertToRegionCodes(
        country: string | string[] | null | undefined,
    ): string[] | undefined {
        if (!country) {
            return undefined;
        }

        return Array.isArray(country) ? country : [country];
    }
}
