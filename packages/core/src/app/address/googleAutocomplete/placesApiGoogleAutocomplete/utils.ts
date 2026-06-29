import { type AutocompleteItem } from '@bigcommerce/checkout/ui';

import { type GoogleAutocompleteOptionTypes } from '../googleAutocompleteTypes';

/**
 * Maps legacy Places API collection filters to valid Table A/B primary types
 * accepted by the new AutocompleteSuggestion API.
 *
 * - 'geocode' has no direct equivalent; omitting includedPrimaryTypes gives
 *   broad address/region results — the same intent as the legacy filter.
 * - 'address' maps to 'street_address' for address-only results.
 * - 'establishment' remains valid in Table B.
 */
const LEGACY_TYPE_MAP: Record<GoogleAutocompleteOptionTypes, string | null> = {
    geocode: null,
    address: 'street_address',
    establishment: 'establishment',
};

export const mapToIncludedPrimaryTypes = (
    types: GoogleAutocompleteOptionTypes[],
): string[] | undefined => {
    const mapped = types.map((t) => LEGACY_TYPE_MAP[t]).filter((t): t is string => t !== null);

    return mapped.length > 0 ? mapped : undefined;
};

export const mapToAutocompleteItems = (
    suggestions: google.maps.places.AutocompleteSuggestion[],
): AutocompleteItem[] =>
    suggestions.flatMap((suggestion) => {
        const { placePrediction } = suggestion;

        if (!placePrediction) return [];

        return [
            {
                label: placePrediction.text?.text ?? '',
                value: placePrediction.mainText?.text ?? '',
                highlightedSlices: (placePrediction.text?.matches ?? []).map(
                    ({ startOffset, endOffset }) => ({
                        offset: startOffset,
                        length: endOffset - startOffset,
                    }),
                ),
                id: placePrediction.placeId,
            },
        ];
    });

/**
 * Maps legacy Places API field names (snake_case, used by the legacy getDetails
 * service) to the new Places REST API field-mask names (camelCase). Names that
 * are already new-API names — or any unrecognised name — pass through unchanged,
 * and the result is de-duplicated. Defaults to address + name when none given.
 */
const LEGACY_FIELD_MAP: Record<string, string> = {
    address_components: 'addressComponents',
    name: 'displayName',
};

export const mapToPlaceDetailsFieldMask = (fields?: string[]): string[] => {
    const source = fields?.length ? fields : ['address_components', 'name'];

    return Array.from(new Set(source.map((field) => LEGACY_FIELD_MAP[field] ?? field)));
};

export const mapToGeocoderAddressComponent = (
    c: { longText?: string | null; shortText?: string | null; types?: string[] | null },
): google.maps.GeocoderAddressComponent => ({
    long_name: c.longText ?? '',
    short_name: c.shortText ?? '',
    types: c.types ?? [],
});
