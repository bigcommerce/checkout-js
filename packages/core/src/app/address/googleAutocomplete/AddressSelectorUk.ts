import AddressSelector from './AddressSelector';

export default class AddressSelectorUK extends AddressSelector {
    getState(): string {
        return '';
    }

    getStreet2(): string {
        return this._get('locality', 'long_name');
    }

    getPostCode(): string {
        return '';
    }
}
