import { GoogleAddressFieldType } from './googleAutocompleteTypes';

export default class AddressSelector {
    protected _address: google.maps.GeocoderAddressComponent[] | undefined;
    protected _name: string;

    constructor(googlePlace: google.maps.places.PlaceResult) {
        const { address_components, name } = googlePlace;

        this._name = name;
        this._address = address_components;
    }

    getState(): string {
        return this._get('administrative_area_level_1', 'short_name');
    }

    getStreet(): string {
        return this._name;
    }

    getStreet2(): string {
        if (this.getCountry() === 'NZ') {
            return this._get('sublocality', 'short_name');
        }

        return this._get('subpremise', 'short_name');
    }

    getCity(): string {
        return (
            this._get('postal_town', 'long_name') ||
            this._get('locality', 'long_name') ||
            this._get('neighborhood', 'short_name')
        );
    }

    getCountry(): string {
        return this._get('country', 'short_name');
    }

    getPostCode(): string {
        return this._get('postal_code', 'short_name');
    }

    protected _get(
        type: GoogleAddressFieldType,
        access: Exclude<keyof google.maps.GeocoderAddressComponent, 'types'>,
    ): string {
        const element =
            this._address && this._address.find((field) => field.types.indexOf(type) !== -1);

        if (element) {
            return element[access];
        }

        return '';
    }
}
