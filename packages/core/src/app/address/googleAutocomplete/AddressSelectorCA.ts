import AddressSelector from './AddressSelector';

export default class AddressSelectorUK extends AddressSelector {
    getCity(): string {
        return this._get('political', 'long_name');
        ;
    }
}
