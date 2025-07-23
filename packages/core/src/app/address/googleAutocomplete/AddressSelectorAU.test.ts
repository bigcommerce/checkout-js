import AddressSelectorAU from "./AddressSelectorAU";
import { getGoogleAutocompletePlaceMock } from "./googleAutocompleteResult.mock";

describe('AddressSelectorAU', () => {
    const googleAutocompletePlaceMock = getGoogleAutocompletePlaceMock();

    it('should return correct street address with subpremise', () => {
        const selector = new AddressSelectorAU(googleAutocompletePlaceMock);

        expect(selector.getStreet()).toBe('unit 6/1-3 (l) Smail Street');
    });

    it('should return correct street address without subpremise', () => {
        const selector = new AddressSelectorAU({
            ...googleAutocompletePlaceMock,
            address_components: googleAutocompletePlaceMock.address_components?.slice(1),
        });

        expect(selector.getStreet()).toBe('1-3 (l) Smail Street');
    });

    it('should return correct street2 address value', () => {
        const selector = new AddressSelectorAU(googleAutocompletePlaceMock);

        expect(selector.getStreet2()).toBe('');
    });
});
