import type { AutocompleteItem } from '@bigcommerce/checkout/ui';

import type { GoogleAutocompleteOptionTypes } from '../googleAutocompleteTypes';

import { getGoogleAutocompleteScriptLoader } from './getGoogleAutocompleteScriptLoader';
import type { GoogleAutocompleteScriptLoader } from './GoogleAutocompleteScriptLoader';
import { mapToAutocompleteItems, mapToIncludedPrimaryTypes } from './utils';

interface PlacesRestResponse {
    addressComponents?: Array<{
        longText?: string;
        shortText?: string;
        types?: string[];
    }>;
    displayName?: { text: string };
}

export class GoogleAutocompleteService {
    private _sessionToken?: google.maps.places.AutocompleteSessionToken;

    constructor(
        private _apiKey: string,
        private _scriptLoader: GoogleAutocompleteScriptLoader = getGoogleAutocompleteScriptLoader(),
    ) {}

    async getSuggestions(
        input: string,
        types: string[] | undefined,
        componentRestrictions?: google.maps.places.ComponentRestrictions,
    ): Promise<AutocompleteItem[]> {
        const { AutocompleteSuggestion, AutocompleteSessionToken } =
            await this._scriptLoader.loadPlacesLibrary(this._apiKey);

        if (!this._sessionToken) {
            this._sessionToken = new AutocompleteSessionToken();
        }

        const includedRegionCodes = this.convertToRegionCodes(componentRestrictions?.country);
        const includedPrimaryTypes = mapToIncludedPrimaryTypes(
            (types ?? ['geocode']) as GoogleAutocompleteOptionTypes[],
        );

        const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input,
            includedPrimaryTypes,
            includedRegionCodes,
            sessionToken: this._sessionToken,
        });

        return mapToAutocompleteItems(suggestions);
    }

    async getPlaceDetails(
        placeId: string,
        fields?: string[],
    ): Promise<google.maps.places.PlaceResult> {
        // Consume and reset the session token
        this._sessionToken = undefined;

        // Place.fetchFields silently does nothing when Maps JS was loaded via libraries=places
        // (ApiTargetBlockedMapError corrupts the SDK transport). Use the Places REST API
        // directly — it is completely independent of JS SDK auth state.
        const requestedFields = fields?.length ? fields : ['addressComponents', 'displayName'];
        const response = await fetch(
            `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?key=${this._apiKey}`,
            { headers: { 'X-Goog-FieldMask': requestedFields.join(',') } },
        );

        if (!response.ok) {
            throw new Error(`Places API request failed with status ${response.status}`);
        }

        const data = (await response.json()) as PlacesRestResponse;

        return {
            address_components: data.addressComponents?.map((c) => ({
                long_name: c.longText ?? '',
                short_name: c.shortText ?? '',
                types: c.types ?? [],
            })),
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
