import AddressSelector from './AddressSelector';

export default class AddressSelectorCA extends AddressSelector {
    getCity(): string {
        return this._get('sublocality_level_1', 'long_name') || this._get('locality', 'long_name');
    }
}
