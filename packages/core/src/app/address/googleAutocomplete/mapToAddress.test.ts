import { getCountries } from '../../geography/countries.mock';

import {
    getGoogleAutocompleteAUPlaceMock,
    getGoogleAutocompletePlaceMock,
} from './googleAutocompleteResult.mock';
import mapToAddress from './mapToAddress';

describe('mapToAddress()', () => {
    it('returns a partial address with hydrated province', () => {
        const googlePlace = getGoogleAutocompletePlaceMock();
        const countries = getCountries();

        const address = mapToAddress(googlePlace, countries);

        expect(address).toMatchObject({
            city: 'Ultimo PT (l)',
            countryCode: 'AU',
            postalCode: '2007',
            stateOrProvince: 'New South Wales',
            stateOrProvinceCode: 'NSW',
        });
    });

    it('restores a street number suffix stripped by place details for AU addresses', () => {
        const address = mapToAddress(
            getGoogleAutocompleteAUPlaceMock(),
            getCountries(),
            '34a Bayford Street',
        );

        expect(address.address1).toBe('34a Bayford Street');
    });

    it('keeps the place details street when the prediction has no extra suffix', () => {
        const googlePlace = getGoogleAutocompletePlaceMock();

        const address = mapToAddress(googlePlace, getCountries(), 'unit 6/1-3 Smail St');

        expect(address.address1).toBe('unit 6/1-3 (l) Smail Street');
    });

    it('returns a partial address with province code when no countries are passed', () => {
        const googlePlace = getGoogleAutocompletePlaceMock();

        const address = mapToAddress(googlePlace);

        expect(address).toMatchObject({
            city: 'Ultimo PT (l)',
            countryCode: 'AU',
            postalCode: '2007',
            stateOrProvince: 'NSW',
            stateOrProvinceCode: '',
        });
    });
});
