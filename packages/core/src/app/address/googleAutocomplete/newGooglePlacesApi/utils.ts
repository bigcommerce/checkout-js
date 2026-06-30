import { type AutocompleteItem } from '@bigcommerce/checkout/ui';

import { type GoogleAutocompleteOptionTypes } from '../googleAutocompleteTypes';

const LEGACY_TO_NEW_TYPE_MAP: Record<GoogleAutocompleteOptionTypes, string | null> = {
    geocode: null,
    address: 'street_address',
    establishment: 'establishment',
};

const LEGACY_TO_NEW_FIELD_MAP: Record<string, string> = {
    address_components: 'addressComponents',
    name: 'displayName',
};

export const mapLegacyToNewIncludedPrimaryTypes = (
    legacyTypes: GoogleAutocompleteOptionTypes[],
): string[] | undefined => {
    const mapped = legacyTypes
        .map((legacyType) => LEGACY_TO_NEW_TYPE_MAP[legacyType])
        .filter((newType): newType is string => newType !== null);

    return mapped.length > 0 ? mapped : undefined;
};

export const mapSuggestionsToAutocompleteItems = (
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

export const mapLegacyToNewPlaceDetailsFieldMask = (fields?: string[]): string[] => {
    const source = fields?.length ? fields : ['address_components', 'name'];

    return Array.from(new Set(source.map((field) => LEGACY_TO_NEW_FIELD_MAP[field] ?? field)));
};

export const mapNewToLegacyGeocoderAddressComponent = (newAdressComponent: {
    longText?: string | null;
    shortText?: string | null;
    types?: string[] | null;
}): google.maps.GeocoderAddressComponent => ({
    long_name: newAdressComponent.longText ?? '',
    short_name: newAdressComponent.shortText ?? '',
    types: newAdressComponent.types ?? [],
});
