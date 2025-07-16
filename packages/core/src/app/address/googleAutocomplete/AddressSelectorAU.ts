import AddressSelector from './AddressSelector';

export default class AddressSelectorAU extends AddressSelector {
    getStreet(): string {
        return `${this._get('subpremise', 'long_name')} ${this._get('street_number', 'long_name')} ${this._get('route', 'long_name')}`;
    }

    getStreet2(): string {
        return '';
    }
}
