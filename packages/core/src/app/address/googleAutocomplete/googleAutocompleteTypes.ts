export type GoogleAutocompleteOptionTypes = 'establishment' | 'geocode' | 'address';

export interface GoogleMapsSdk {
    places: {
        AutocompleteService?: new () => google.maps.places.AutocompleteService;
        PlacesService?: new (attrContainer: HTMLDivElement) => google.maps.places.PlacesService;
    };
}

export interface GoogleAutocompleteWindow extends Window {
    google: {
        maps: GoogleMapsSdk;
    };
}

// Satisfied by both legacy API (GoogleAutocompleteScriptLoader via`@bigcommerce/script-loader`)
// and by new API (NewGooglePlacesApiScriptLoader's via importLibrary path)
export interface GoogleMapsPlacesScriptLoader {
    loadMapsSdk(apiKey: string): Promise<GoogleMapsSdk>;
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
