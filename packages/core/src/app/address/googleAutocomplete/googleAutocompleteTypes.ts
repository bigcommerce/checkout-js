export type GoogleAutocompleteOptionTypes = 'establishment' | 'geocode' | 'address';

export interface WindowWithGoogleMaps extends Window {
    google?: {
        maps: {
            importLibrary: (libraryName: string) => Promise<google.maps.PlacesLibrary>;
        };
    };
}

export type GoogleAddressFieldType =
    | 'postal_town'
    | 'administrative_area_level_1'
    | 'administrative_area_level_2'
    | 'locality'
    | 'neighborhood'
    | 'postal_code'
    | 'street_number'
    | 'route'
    | 'political'
    | 'country'
    | 'subpremise'
    | 'sublocality'
    | 'sublocality_level_1';
