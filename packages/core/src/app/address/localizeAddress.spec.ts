import { Address } from '@bigcommerce/checkout-sdk';

import { getCountries } from '../geography/countries.mock';

import { getAddress } from './address.mock';
import localizeAddress from './localizeAddress';

describe('localizeAddress', () => {
    let address: Address;

    beforeEach(() => {
        address = getAddress();
    });

    it('localizes address with provided countries', () => {
        expect(localizeAddress(address, getCountries())).toMatchObject({
            ...address,
            localizedCountry: 'United States',
            localizedProvince: 'California',
        });
    });

    it('keeps same value if unable match countryCode', () => {
        expect(localizeAddress(address, [])).toMatchObject({
            ...address,
            localizedCountry: 'United States',
            localizedProvince: 'California',
        });
    });

    it('keeps same value if unable to provinceCode', () => {
        const countries = getCountries().map((country) => ({
            ...country,
            subdivisions: [],
        }));

        expect(localizeAddress(address, countries)).toMatchObject({
            ...address,
            localizedCountry: 'United States',
            localizedProvince: 'California',
        });
    });
});
