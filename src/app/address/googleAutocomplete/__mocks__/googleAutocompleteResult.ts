export function getGoogleAutocompletePlaceMock(): google.maps.places.PlaceResult {
    return {
        name: '1-3 Smail St',
        address_components: [
            {
                long_name: '1-3 (l)',
                short_name: '1-3 (s)',
                types: [
                    'street_number',
                ],
            },
            {
                long_name: 'Smail Street',
                short_name: 'Smail St',
                types: [
                    'route',
                ],
            },
            {
                long_name: 'Ultimo PT (l)',
                short_name: 'Ultimo PT',
                types: [
                    'postal_town',
                ],
            },
            {
                long_name: 'Ultimo (l)',
                short_name: 'Ultimo',
                types: [
                    'locality',
                    'political',
                ],
            },
            {
                long_name: 'Ultimo N (l)',
                short_name: 'Ultimo N',
                types: [
                    'neighborhood',
                ],
            },
            {
                long_name: 'Council of the City of Sydney',
                short_name: 'Sydney',
                types: [
                    'administrative_area_level_2',
                    'political',
                ],
            },
            {
                long_name: 'New South Wales',
                short_name: 'NSW',
                types: [
                    'administrative_area_level_1',
                    'political',
                ],
            },
            {
                long_name: 'Australia',
                short_name: 'AU',
                types: [
                    'country',
                    'political',
                ],
            },
            {
                long_name: '2007  (l)',
                short_name: '2007',
                types: [
                    'postal_code',
                ],
            },
        ],
    } as google.maps.places.PlaceResult;
}
