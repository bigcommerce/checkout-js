import { type AutocompleteItem } from '@bigcommerce/checkout/ui';

export const mapToAutocompleteItems = (
    suggestions: google.maps.places.AutocompleteSuggestion[],
): AutocompleteItem[] =>
    suggestions.flatMap((suggestion) => {
        const { placePrediction } = suggestion;

        if (!placePrediction) return [];

        return [
            {
                label: placePrediction.text.text,
                value: placePrediction.mainText?.text ?? '',
                highlightedSlices: (placePrediction.text.matches ?? []).map(
                    ({ startOffset, endOffset }) => ({
                        offset: startOffset,
                        length: endOffset - startOffset,
                    }),
                ),
                id: placePrediction.placeId,
            },
        ];
    });

export const mapToGeocoderAddressComponent = (
    c: google.maps.places.AddressComponent,
): google.maps.GeocoderAddressComponent => ({
    long_name: c.longText ?? '',
    short_name: c.shortText ?? '',
    types: c.types ?? [],
});
