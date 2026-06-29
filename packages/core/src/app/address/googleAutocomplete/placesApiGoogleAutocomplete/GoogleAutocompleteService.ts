import type { AutocompleteItem } from '@bigcommerce/checkout/ui';

import type { GoogleAutocompleteOptionTypes } from '../googleAutocompleteTypes';

import { getGoogleAutocompleteScriptLoader } from './getGoogleAutocompleteScriptLoader';
import type { GoogleAutocompleteScriptLoader } from './GoogleAutocompleteScriptLoader';
import {
    mapToAutocompleteItems,
    mapToGeocoderAddressComponent,
    mapToIncludedPrimaryTypes,
    mapToPlaceDetailsFieldMask,
} from './utils';

interface PlacesRestResponse {
    addressComponents?: Array<{
        longText?: string;
        shortText?: string;
        types?: string[];
    }>;
    displayName?: { text: string };
}

export class GoogleAutocompleteService {
    constructor(
        private _apiKey: string,
        private _scriptLoader: GoogleAutocompleteScriptLoader = getGoogleAutocompleteScriptLoader(),
    ) {}

    async getSuggestions(
        input: string,
        types: GoogleAutocompleteOptionTypes[] | undefined,
        componentRestrictions?: google.maps.places.ComponentRestrictions,
    ): Promise<AutocompleteItem[]> {
        const { AutocompleteSuggestion } = await this._scriptLoader.loadPlacesLibrary(this._apiKey);

        const includedRegionCodes = this.convertToRegionCodes(componentRestrictions?.country);
        const includedPrimaryTypes = mapToIncludedPrimaryTypes(types ?? ['geocode']);

        const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input,
            includedPrimaryTypes,
            includedRegionCodes,
        });

        return mapToAutocompleteItems(suggestions);
    }

    async getPlaceDetails(
        placeId: string,
        fields?: string[],
    ): Promise<google.maps.places.PlaceResult> {
        // Place.fetchFields silently does nothing when Maps JS was loaded via libraries=places
        // (ApiTargetBlockedMapError corrupts the SDK transport). Use the Places REST API
        // directly — it is completely independent of JS SDK auth state.
        //
        // Callers pass legacy (snake_case) field names since the same `fields` prop also
        // feeds the legacy getDetails API; translate them to the new REST field-mask names.
        const fieldMask = mapToPlaceDetailsFieldMask(fields).join(',');
        const response = await fetch(
            `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?key=${this._apiKey}`,
            { headers: { 'X-Goog-FieldMask': fieldMask } },
        );

        if (!response.ok) {
            throw new Error(`Places API request failed with status ${response.status}`);
        }

        const data = (await response.json()) as PlacesRestResponse;

        return {
            address_components: data.addressComponents?.map(mapToGeocoderAddressComponent),
            name: data.displayName?.text ?? '',
        };
    }

    private convertToRegionCodes(
        country: string | string[] | null | undefined,
    ): string[] | undefined {
        if (!country) return undefined;

        return Array.isArray(country) ? country : [country];
    }
}
