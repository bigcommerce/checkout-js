import {
    mapLegacyToNewIncludedPrimaryTypes,
    mapLegacyToNewPlaceDetailsFieldMask,
    mapNewToLegacyGeocoderAddressComponent,
    mapSuggestionsToAutocompleteItems,
} from './utils';

describe('mapLegacyToNewPlaceDetailsFieldMask', () => {
    it('maps legacy snake_case field names to new-API camelCase names', () => {
        expect(mapLegacyToNewPlaceDetailsFieldMask(['address_components', 'name'])).toEqual([
            'addressComponents',
            'displayName',
        ]);
    });

    it('passes through new-API field names unchanged', () => {
        expect(mapLegacyToNewPlaceDetailsFieldMask(['addressComponents', 'displayName'])).toEqual([
            'addressComponents',
            'displayName',
        ]);
    });

    it('de-duplicates fields that map to the same name', () => {
        expect(mapLegacyToNewPlaceDetailsFieldMask(['name', 'displayName'])).toEqual([
            'displayName',
        ]);
    });

    it('defaults to address components and display name when none provided', () => {
        expect(mapLegacyToNewPlaceDetailsFieldMask()).toEqual(['addressComponents', 'displayName']);
        expect(mapLegacyToNewPlaceDetailsFieldMask([])).toEqual([
            'addressComponents',
            'displayName',
        ]);
    });
});

describe('mapLegacyToNewIncludedPrimaryTypes', () => {
    it('maps "address" to "street_address"', () => {
        expect(mapLegacyToNewIncludedPrimaryTypes(['address'])).toEqual(['street_address']);
    });

    it('keeps "establishment" as-is', () => {
        expect(mapLegacyToNewIncludedPrimaryTypes(['establishment'])).toEqual(['establishment']);
    });

    it('returns undefined for "geocode" (no direct equivalent)', () => {
        expect(mapLegacyToNewIncludedPrimaryTypes(['geocode'])).toBeUndefined();
    });

    it('filters out null-mapped types and returns the rest', () => {
        expect(mapLegacyToNewIncludedPrimaryTypes(['geocode', 'address'])).toEqual([
            'street_address',
        ]);
    });

    it('returns undefined for an empty array', () => {
        expect(mapLegacyToNewIncludedPrimaryTypes([])).toBeUndefined();
    });
});

describe('mapSuggestionsToAutocompleteItems', () => {
    it('maps a suggestion to an autocomplete item', () => {
        const mockSuggestions: google.maps.places.AutocompleteSuggestion[] = [
            {
                placePrediction: {
                    placeId: 'place-1',
                    text: {
                        text: '123 Main St, New York',
                        matches: [{ startOffset: 0, endOffset: 3 }],
                    },
                    mainText: { text: '123 Main St' },
                } as google.maps.places.PlacePrediction,
            },
        ];

        const items = mapSuggestionsToAutocompleteItems(mockSuggestions);

        expect(items).toHaveLength(1);
        expect(items[0]).toMatchObject({
            id: 'place-1',
            label: '123 Main St, New York',
            value: '123 Main St',
            highlightedSlices: [{ offset: 0, length: 3 }],
        });
    });

    it('skips suggestions without placePrediction', () => {
        const mockSuggestionsWithoutPlacePrediction: google.maps.places.AutocompleteSuggestion[] = [
            { placePrediction: null },
        ];

        expect(mapSuggestionsToAutocompleteItems(mockSuggestionsWithoutPlacePrediction)).toEqual(
            [],
        );
    });
});

describe('mapNewToLegacyGeocoderAddressComponent', () => {
    it('maps an AddressComponent to a GeocoderAddressComponent', () => {
        const addressComponentMock = {
            longText: 'New York',
            shortText: 'NY',
            types: ['locality', 'political'],
        } as google.maps.places.AddressComponent;

        expect(mapNewToLegacyGeocoderAddressComponent(addressComponentMock)).toEqual({
            long_name: 'New York',
            short_name: 'NY',
            types: ['locality', 'political'],
        });
    });

    it('falls back to empty strings and empty array when fields are missing', () => {
        const component = {} as google.maps.places.AddressComponent;

        expect(mapNewToLegacyGeocoderAddressComponent(component)).toEqual({
            long_name: '',
            short_name: '',
            types: [],
        });
    });
});
