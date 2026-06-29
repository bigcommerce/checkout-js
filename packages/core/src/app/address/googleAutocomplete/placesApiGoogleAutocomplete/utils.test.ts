import {
    mapToAutocompleteItems,
    mapToGeocoderAddressComponent,
    mapToIncludedPrimaryTypes,
    mapToPlaceDetailsFieldMask,
} from './utils';

describe('mapToPlaceDetailsFieldMask', () => {
    it('maps legacy snake_case field names to new-API camelCase names', () => {
        expect(mapToPlaceDetailsFieldMask(['address_components', 'name'])).toEqual([
            'addressComponents',
            'displayName',
        ]);
    });

    it('passes through new-API field names unchanged', () => {
        expect(mapToPlaceDetailsFieldMask(['addressComponents', 'displayName'])).toEqual([
            'addressComponents',
            'displayName',
        ]);
    });

    it('de-duplicates fields that map to the same name', () => {
        expect(mapToPlaceDetailsFieldMask(['name', 'displayName'])).toEqual(['displayName']);
    });

    it('defaults to address components and display name when none provided', () => {
        expect(mapToPlaceDetailsFieldMask()).toEqual(['addressComponents', 'displayName']);
        expect(mapToPlaceDetailsFieldMask([])).toEqual(['addressComponents', 'displayName']);
    });
});

describe('mapToIncludedPrimaryTypes', () => {
    it('maps "address" to "street_address"', () => {
        expect(mapToIncludedPrimaryTypes(['address'])).toEqual(['street_address']);
    });

    it('keeps "establishment" as-is', () => {
        expect(mapToIncludedPrimaryTypes(['establishment'])).toEqual(['establishment']);
    });

    it('returns undefined for "geocode" (no direct equivalent)', () => {
        expect(mapToIncludedPrimaryTypes(['geocode'])).toBeUndefined();
    });

    it('filters out null-mapped types and returns the rest', () => {
        expect(mapToIncludedPrimaryTypes(['geocode', 'address'])).toEqual(['street_address']);
    });

    it('returns undefined for an empty array', () => {
        expect(mapToIncludedPrimaryTypes([])).toBeUndefined();
    });
});

describe('mapToAutocompleteItems', () => {
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

        const items = mapToAutocompleteItems(mockSuggestions);

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

        expect(mapToAutocompleteItems(mockSuggestionsWithoutPlacePrediction)).toEqual([]);
    });
});

describe('mapToGeocoderAddressComponent', () => {
    it('maps an AddressComponent to a GeocoderAddressComponent', () => {
        const addressComponentMock = {
            longText: 'New York',
            shortText: 'NY',
            types: ['locality', 'political'],
        } as google.maps.places.AddressComponent;

        expect(mapToGeocoderAddressComponent(addressComponentMock)).toEqual({
            long_name: 'New York',
            short_name: 'NY',
            types: ['locality', 'political'],
        });
    });

    it('falls back to empty strings and empty array when fields are missing', () => {
        const component = {} as google.maps.places.AddressComponent;

        expect(mapToGeocoderAddressComponent(component)).toEqual({
            long_name: '',
            short_name: '',
            types: [],
        });
    });
});
