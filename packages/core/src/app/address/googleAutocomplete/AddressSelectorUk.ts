import AddressSelector from './AddressSelector';

export default class AddressSelectorUK extends AddressSelector {
    getState(): string {
        return this._get('administrative_area_level_2', 'long_name');
    }

    getStreet2(): string {
        return this._get('locality', 'long_name');
    }
}
