import AddressSelector from './AddressSelector';

export default class AddressSelectorAU extends AddressSelector {
    getStreet(): string {
        const subpremise = this._get('subpremise', 'short_name');
        const subpremisePart = subpremise ? `${subpremise}/` : '';

        return `${subpremisePart}${this._get('street_number', 'long_name')} ${this._get('route', 'long_name')}`;
    }

    getStreet2(): string {
        return '';
    }
}
