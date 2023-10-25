import AddressSelector from './AddressSelector';
import AddressSelectorCA from './AddressSelectorCA';
import AddressSelectorUK from './AddressSelectorUk';

export default class AddressSelectorFactory {
    static create(autocompleteData: google.maps.places.PlaceResult): AddressSelector {
        const countryComponent = autocompleteData.address_components?.find(
            component => component.types.indexOf('country') >= 0);
        const countryShortName = countryComponent?.short_name || '';

        switch (countryShortName) {
            case 'GB':
                return new AddressSelectorUK(autocompleteData);

            case 'CA':
                return new AddressSelectorCA(autocompleteData);

            default:
                return new AddressSelector(autocompleteData);
        }
    }
}
