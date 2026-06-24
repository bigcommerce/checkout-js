import type { AutocompleteItem } from '@bigcommerce/checkout/ui';

/**
 * Common interface for Google Autocomplete service implementations.
 *
 * Two implementations exist:
 *  - `GoogleAutocompleteService` (root) — legacy Places API (callback-based)
 *  - `placesNew/GoogleAutocompleteService` — Places API (New), promise-based
 *
 * Pass an instance via the `service` prop on `GoogleAutocomplete` to select
 * which backend to use.
 */
export interface IGoogleAutocompleteService {
    getSuggestions(
        input: string,
        types: string[] | undefined,
        componentRestrictions?: google.maps.places.ComponentRestrictions,
    ): Promise<AutocompleteItem[]>;

    getPlaceDetails(
        placeId: string,
        fields?: string[],
    ): Promise<google.maps.places.PlaceResult>;
}
