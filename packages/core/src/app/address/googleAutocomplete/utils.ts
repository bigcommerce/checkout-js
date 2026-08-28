import { type AutocompleteItem } from '@bigcommerce/checkout/ui';

export const toAutocompleteItems = (
    results?: google.maps.places.AutocompletePrediction[],
): AutocompleteItem[] => {
    return (results || []).map((result) => ({
        label: result.description,
        value: result.structured_formatting.main_text,
        highlightedSlices: result.matched_substrings,
        id: result.place_id,
    }));
};

export const restoreStreetNumberSuffix = (
    placeDetailsStreet: string,
    selectedAutocompleteText?: string,
): string => {
    if (!placeDetailsStreet || !selectedAutocompleteText) {
        return placeDetailsStreet;
    }

    const [streetNumber, ...rest] = placeDetailsStreet.split(' ');
    const [autocompleteNumber] = selectedAutocompleteText.split(' ');

    if (
        !streetNumber ||
        !autocompleteNumber ||
        autocompleteNumber.length <= streetNumber.length ||
        !autocompleteNumber.toLowerCase().startsWith(streetNumber.toLowerCase())
    ) {
        return placeDetailsStreet;
    }

    const suffix = autocompleteNumber.slice(streetNumber.length);

    if (!/^[a-z]{1,2}$/i.test(suffix)) {
        return placeDetailsStreet;
    }

    return [autocompleteNumber, ...rest].join(' ');
};
