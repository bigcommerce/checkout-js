import { getCountries } from '../../geography/countries.mock';

import { getGoogleAutocompletePlaceMock } from './googleAutocompleteResult.mock';
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
