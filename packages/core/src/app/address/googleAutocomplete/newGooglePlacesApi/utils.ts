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

export const mapNewToLegacyGeocoderAddressComponent = (newAddressComponent: {
    longText?: string | null;
    shortText?: string | null;
    types?: string[] | null;
}): google.maps.GeocoderAddressComponent => ({
    long_name: newAddressComponent.longText ?? '',
    short_name: newAddressComponent.shortText ?? '',
    types: newAddressComponent.types ?? [],
});

// places.googleapis.com is gRPC-Web, so failures arrive as an `RpcError` with a numeric gRPC status `code`.
// Code 7 is a consistent PERMISSION_DENIED and not anything transient
const GRPC_PERMISSION_DENIED = 7;

export const isNewPlacesApiPermissionDenied = (error: unknown): boolean => {
    const rpcError = error as { name?: unknown; code?: unknown } | null | undefined;

    return rpcError?.name === 'RpcError' && rpcError.code === GRPC_PERMISSION_DENIED;
};
