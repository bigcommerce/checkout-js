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

const hasDigits = (token: string): boolean => {
    return /\d/.test(token);
};

export const restoreStreetNumberSuffix = (
    placeDetailsAddress: string,
    selectedAutocompleteAddress?: string,
): string => {
    if (!placeDetailsAddress || !selectedAutocompleteAddress) {
        return placeDetailsAddress;
    }

    const placeDetailsTokens = placeDetailsAddress.split(' ');
    const selectedAutocompleteTokens = selectedAutocompleteAddress.split(' ');

    const placeDetailsStreetNumberIndex = placeDetailsTokens.findIndex(hasDigits);
    const autocompleteStreetNumber = selectedAutocompleteTokens.find(hasDigits);

    if (placeDetailsStreetNumberIndex === -1 || !autocompleteStreetNumber) {
        return placeDetailsAddress;
    }

    const placeDetailsStreetNumber = placeDetailsTokens[placeDetailsStreetNumberIndex];

    const extendsPlaceDetailsStreetNumber = autocompleteStreetNumber
        .toLowerCase()
        .startsWith(placeDetailsStreetNumber.toLowerCase());

    if (!extendsPlaceDetailsStreetNumber) {
        return placeDetailsAddress;
    }

    const lostLetterSuffix = autocompleteStreetNumber.slice(placeDetailsStreetNumber.length);

    if (!/^[a-z]$/i.test(lostLetterSuffix)) {
        return placeDetailsAddress;
    }

    placeDetailsTokens[placeDetailsStreetNumberIndex] =
        `${placeDetailsStreetNumber}${lostLetterSuffix.toUpperCase()}`;

    return placeDetailsTokens.join(' ');
};
