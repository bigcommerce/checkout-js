import AddressSelector from './AddressSelector';
import AddressSelectorAU from './AddressSelectorAU';
import AddressSelectorCA from './AddressSelectorCA';
import AddressSelectorUK from './AddressSelectorUk';

export default class AddressSelectorFactory {
    static create(autocompleteData: google.maps.places.PlaceResult): AddressSelector {
        const countryComponent = autocompleteData.address_components?.find(
            component => component.types.includes('country'));
        const countryShortName = countryComponent?.short_name || '';

        switch (countryShortName) {
            case 'GB':
                return new AddressSelectorUK(autocompleteData);

            case 'CA':
                return new AddressSelectorCA(autocompleteData);
            
            case 'AU':
                return new AddressSelectorAU(autocompleteData);

            default:
                return new AddressSelector(autocompleteData);
        }
    }
}
