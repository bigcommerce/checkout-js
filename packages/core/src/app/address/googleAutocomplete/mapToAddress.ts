import { Address, Country, Region } from '@bigcommerce/checkout-sdk';

import AddressSelectorFactory from './AddressSelectorFactory';

export default function mapToAddress(
    autocompleteData: google.maps.places.PlaceResult,
    countries: Country[] = [],
): Partial<Address> {
    if (!autocompleteData || !autocompleteData.address_components) {
        return {};
    }

    const accessor = AddressSelectorFactory.create(autocompleteData);
    const state = accessor.getState();
    const countryCode = accessor.getCountry();
    const country = countries && countries.find((c) => countryCode === c.code);
    const street2 = accessor.getStreet2();

    return {
        address2: street2,
        city: accessor.getCity(),
        countryCode,
        postalCode: accessor.getPostCode(),
        ...(state ? getState(state, country && country.subdivisions) : {}),
    };
}

function getState(stateName: string, states: Region[] = []): Partial<Address> {
    const state = states.find(({ code, name }: Region) => code === stateName || name === stateName);

    if (!state) {
        return {
            stateOrProvince: !states.length ? stateName : '',
            stateOrProvinceCode: '',
        };
    }

    return {
        stateOrProvince: state.name,
        stateOrProvinceCode: state.code,
    };
}
