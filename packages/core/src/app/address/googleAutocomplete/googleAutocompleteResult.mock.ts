export function getGoogleAutocompletePlaceMock(): google.maps.places.PlaceResult {
    return {
        name: '1-3 Smail St',
        address_components: [
            {
                long_name: 'unit 6',
                short_name: 'unit 6',
                types: ['subpremise'],
            },
            {
                long_name: '1-3 (l)',
                short_name: '1-3 (s)',
                types: ['street_number'],
            },
            {
                long_name: 'Smail Street',
                short_name: 'Smail St',
                types: ['route'],
            },
            {
                long_name: 'Ultimo PT (l)',
                short_name: 'Ultimo PT',
                types: ['postal_town'],
            },
            {
                long_name: 'Ultimo (l)',
                short_name: 'Ultimo',
                types: ['locality', 'political'],
            },
            {
                long_name: 'Ultimo N (l)',
                short_name: 'Ultimo N',
                types: ['neighborhood'],
            },
            {
                long_name: 'Council of the City of Sydney',
                short_name: 'Sydney',
                types: ['administrative_area_level_2', 'political'],
            },
            {
                long_name: 'New South Wales',
                short_name: 'NSW',
                types: ['administrative_area_level_1', 'political'],
            },
            {
                long_name: 'Australia',
                short_name: 'AU',
                types: ['country', 'political'],
            },
            {
                long_name: '2007  (l)',
                short_name: '2007',
                types: ['postal_code'],
            },
        ],
    } as google.maps.places.PlaceResult;
}

export function getGoogleAutocompleteNZPlaceMock(): google.maps.places.PlaceResult {
    return {
        name: '6d/17 Alberton Avenue',
        address_components: [
            {
               "long_name" : "6d",
               "short_name" : "6d",
               "types" : [ "subpremise" ]
            },
            {
               "long_name" : "17",
               "short_name" : "17",
               "types" : [ "street_number" ]
            },
            {
               "long_name" : "Alberton Avenue",
               "short_name" : "Alberton Ave",
               "types" : [ "route" ]
            },
            {
               "long_name" : "Mount Albert",
               "short_name" : "Mount Albert",
               "types" : [ "sublocality_level_1", "sublocality", "political" ]
            },
            {
               "long_name" : "Auckland",
               "short_name" : "Auckland",
               "types" : [ "locality", "political" ]
            },
            {
               "long_name" : "Auckland",
               "short_name" : "Auckland",
               "types" : [ "administrative_area_level_1", "political" ]
            },
            {
               "long_name" : "New Zealand",
               "short_name" : "NZ",
               "types" : [ "country", "political" ]
            },
            {
               "long_name" : "1025",
               "short_name" : "1025",
               "types" : [ "postal_code" ]
            }
        ],
    } as google.maps.places.PlaceResult;
}

export function getGoogleAutocompleteUKPlaceMock(): google.maps.places.PlaceResult {
    return {
        "name" : "unit 1, 123 Buckingham Palace Rd",
        "address_components" : [
            {
                "long_name" : "unit 1",
                "short_name" : "unit 1",
                "types" : [ "subpremise" ]
            },
            {
                "long_name" : "123",
                "short_name" : "123",
                "types" : [ "street_number" ]
            },
            {
                "long_name" : "Buckingham Palace Road",
                "short_name" : "Buckingham Palace Rd",
                "types" : [ "route" ]
            },
            {
                "long_name" : "London",
                "short_name" : "London",
                "types" : [ "postal_town" ]
            },
            {
                "long_name" : "Greater London",
                "short_name" : "Greater London",
                "types" : [ "administrative_area_level_2", "political" ]
            },
            {
                "long_name" : "England",
                "short_name" : "England",
                "types" : [ "administrative_area_level_1", "political" ]
            },
            {
                "long_name" : "United Kingdom",
                "short_name" : "GB",
                "types" : [ "country", "political" ]
            },
            {
                "long_name" : "SW1W 9SR",
                "short_name" : "SW1W 9SR",
                "types" : [ "postal_code" ]
            }
        ],
    } as google.maps.places.PlaceResult;
}

export function getGoogleAutocompleteCAPlaceMockWithSubLocality(): google.maps.places.PlaceResult {
    return {
        "name" : "1934 Montréal Road",
        "address_components" : [
            {
                "long_name" : '1934',
                "short_name" : '1934',
                "types" : ['street_number']
            },
            {
                "long_name" : 'Montréal Road',
                "short_name" : 'Montréal Rd',
                "types" : ['route']
            },
            {
                "long_name" : "Gloucester",
                "short_name" : "Gloucester",
                "types" : ["sublocality_level_1", "sublocality", "political"]
            },
            {
                "long_name" : "Ottawa",
                "short_name" : "Ottawa",
                "types" : [ "locality", "political" ]
            },
            {
                "long_name" : "Ottawa",
                "short_name" : "Ottawa",
                "types" : [ "administrative_area_level_3", "political" ]
            },
            {
                "long_name" : "Ottawa",
                "short_name" : "Ottawa",
                "types" : [ "administrative_area_level_2", "political" ]
            },
            {
                "long_name" : "Ontario",
                "short_name" : "ON",
                "types" : [ "administrative_area_level_1", "political" ]
            },
            {
                "long_name" : "Canada",
                "short_name" : "CA",
                "types" : [ "country", "political" ]
            },
            {
                "long_name" : "K1J 8P3",
                "short_name" : "K1J 8P3",
                "types" : [ "postal_code" ]
            }
        ],
    } as google.maps.places.PlaceResult;
}

export function getGoogleAutocompleteCAPlaceMockWithLocality(): google.maps.places.PlaceResult {
    return {
        "name" : "7 Avenue Southwest",
        "address_components" : [
            {
                "long_name" : '900',
                "short_name" : '900',
                "types" : ['street_number']
            },
            {
                "long_name" : '7 Avenue Southwest',
                "short_name" : 'Avenue Southwest',
                "types" : ['route']
            },
            {
                "long_name" : "Downtown",
                "short_name" : "Downtown",
                "types" : ["neighborhood", "political"]
            },
            {
                "long_name" : "Calgary",
                "short_name" : "Calgary",
                "types" : [ "locality", "political" ]
            },
            {
                "long_name" : "Alberta",
                "short_name" : "AB",
                "types" : [ "administrative_area_level_1", "political" ]
            },
            {
                "long_name" : "Canada",
                "short_name" : "CA",
                "types" : [ "country", "political" ]
            },
            {
                "long_name" : "K1J 8P3",
                "short_name" : "K1J 8P3",
                "types" : [ "postal_code" ]
            }
        ],
    } as google.maps.places.PlaceResult;
}
