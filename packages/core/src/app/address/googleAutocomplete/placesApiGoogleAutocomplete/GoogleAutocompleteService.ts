import type { AutocompleteItem } from '@bigcommerce/checkout/ui';

import type { GoogleAutocompleteOptionTypes } from '../googleAutocompleteTypes';

import { getGoogleAutocompleteScriptLoader } from './getGoogleAutocompleteScriptLoader';
import type { GoogleAutocompleteScriptLoader } from './GoogleAutocompleteScriptLoader';
import {
    mapToAutocompleteItems,
    mapToGeocoderAddressComponent,
    mapToIncludedPrimaryTypes,
} from './utils';

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
        const { Place } = await this._scriptLoader.loadPlacesLibrary(this._apiKey);

        // Consume and reset the session token — the session ends when fetchFields is called.
        // A new token will be created automatically on the next getSuggestions call.
        const sessionToken = this._sessionToken;

        this._sessionToken = undefined;

        const place = new Place({ id: placeId });

        await place.fetchFields({
            fields: fields?.length ? fields : ['addressComponents', 'displayName'],
            sessionToken,
        });

        return {
            address_components: place.addressComponents?.map(mapToGeocoderAddressComponent),
            name: place.displayName ?? '',
        };
    }

    private convertToRegionCodes(
        country: string | string[] | null | undefined,
    ): string[] | undefined {
        if (!country) return undefined;

        return Array.isArray(country) ? country : [country];
    }
}
