import { Address, Country } from '@bigcommerce/checkout-sdk';
import { find, isEmpty } from 'lodash';

import { LocalizedGeography } from '../geography';

const localizeAddress = <T1 extends Address>(
    address: T1,
    countries?: Country[],
): T1 & LocalizedGeography => {
    const country = find(countries, { code: address.countryCode });
    const states = !country || isEmpty(country.subdivisions) ? [] : country.subdivisions;
    const state = find(states, { code: address.stateOrProvinceCode });

    return {
        ...address,
        localizedCountry: country ? country.name : address.country,
        localizedProvince: state ? state.name : address.stateOrProvince,
    };
};

export default localizeAddress;
