import AddressSelector from './AddressSelector';

export default class AddressSelectorUK extends AddressSelector {
    getStreet(): string {
        return this._get('locality', 'long_name');
    }

    getStreet2(): string {
        return '';
    }
}
