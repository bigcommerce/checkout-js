import type { AutocompleteItem } from '@bigcommerce/checkout/ui';

import type { GoogleAutocompleteOptionTypes } from '../googleAutocompleteTypes';

import { getNewGooglePlacesApiScriptLoader } from './getNewGooglePlacesApiScriptLoader';
import type { NewGooglePlacesApiScriptLoader } from './NewGooglePlacesApiScriptLoader';
import {
    mapLegacyToNewIncludedPrimaryTypes,
    mapLegacyToNewPlaceDetailsFieldMask,
    mapNewToOldGeocoderAddressComponent,
    mapSuggestionsToAutocompleteItems,
} from './utils';

export class NewGooglePlacesApiService {
    // A session bundles many autocomplete keystrokes with the single place-details
    // fetch that follows, so Google bills them as one session instead of per request.
    // The token is created on the first keystroke and discarded once details are
    // fetched; the predictions are kept so selection can be resolved via toPlace(),
    // which is what ties the details fetch to the session.
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

        // Fetching details ends the autocomplete session; the next entry starts fresh.
        this.resetSession();

        return {
            address_components: place.addressComponents?.map(mapNewToOldGeocoderAddressComponent),
            name: place.displayName ?? '',
        };
    }

    private async resolvePlace(placeId: string): Promise<google.maps.places.Place> {
        // Resolving via the cached prediction keeps the details fetch inside the
        // billing session that the autocomplete keystrokes opened.
        const prediction = this._predictionsById.get(placeId);

        if (prediction) {
            return prediction.toPlace();
        }

        // No matching prediction (e.g. the session was reset) — fall back to a
        // tokenless lookup, which is billed per request but still resolves.
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
