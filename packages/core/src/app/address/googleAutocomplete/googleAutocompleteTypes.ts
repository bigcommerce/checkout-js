export type GoogleAutocompleteOptionTypes = 'establishment' | 'geocode' | 'address';

export type GoogleAutocompleteFields =
    | 'address_components'
    | 'adr_address'
    | 'aspects'
    | 'formatted_address'
    | 'formatted_phone_number'
    | 'geometry'
    | 'html_attributions'
    | 'icon'
    | 'international_phone_number'
    | 'name'
    | 'opening_hours'
    | 'photos'
    | 'place_id'
    | 'plus_code'
    | 'price_level'
    | 'rating'
    | 'reviews'
    | 'types'
    | 'url'
    | 'utc_offset'
    | 'vicinity'
    | 'website';

export type GoogleAutocompleteEvent = 'place_changed';

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
