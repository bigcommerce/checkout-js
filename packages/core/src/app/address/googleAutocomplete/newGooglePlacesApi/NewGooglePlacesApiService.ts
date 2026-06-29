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

interface PlacesRestResponse {
    addressComponents?: Array<{
        longText?: string;
        shortText?: string;
        types?: string[];
    }>;
    displayName?: { text: string };
}

export class NewGooglePlacesApiService {
    constructor(
        private _apiKey: string,
        private _scriptLoader: NewGooglePlacesApiScriptLoader = getNewGooglePlacesApiScriptLoader(),
    ) {}

    async getSuggestions(
        input: string,
        types: GoogleAutocompleteOptionTypes[] | undefined,
        componentRestrictions?: google.maps.places.ComponentRestrictions,
    ): Promise<AutocompleteItem[]> {
        const { AutocompleteSuggestion } = await this._scriptLoader.loadPlacesLibrary(this._apiKey);

        const includedRegionCodes = this.convertToRegionCodes(componentRestrictions?.country);
        const includedPrimaryTypes = mapLegacyToNewIncludedPrimaryTypes(types ?? ['geocode']);

        const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input,
            includedPrimaryTypes,
            includedRegionCodes,
        });

        return mapSuggestionsToAutocompleteItems(suggestions);
    }

    /* This method uses Places REST API instead of the SDK.
     * Place.fetchFields silently does nothing when Maps JS auth fails.
     * Which is the case when we try legacy Autocomplete first.
     */
    async getPlaceDetails(
        placeId: string,
        fields?: string[],
    ): Promise<google.maps.places.PlaceResult> {
        const fieldMask = mapLegacyToNewPlaceDetailsFieldMask(fields).join(',');

        const response = await fetch(
            `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?key=${this._apiKey}`,
            { headers: { 'X-Goog-FieldMask': fieldMask } },
        );

        if (!response.ok) {
            throw new Error(`Places API request failed with status ${response.status}`);
        }

        const data = (await response.json()) as PlacesRestResponse;

        return {
            address_components: data.addressComponents?.map(mapNewToOldGeocoderAddressComponent),
            name: data.displayName?.text ?? '',
        };
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
