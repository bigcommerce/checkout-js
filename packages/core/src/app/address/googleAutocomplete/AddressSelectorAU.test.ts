import AddressSelectorAU from "./AddressSelectorAU";
import { getGoogleAutocompletePlaceMock } from "./googleAutocompleteResult.mock";

describe('AddressSelectorAU', () => {
    it('should return correct street address', () => {
        const selector = new AddressSelectorAU(getGoogleAutocompletePlaceMock());

        expect(selector.getStreet()).toBe('unit 6 1-3 (l) Smail Street');
    });

    it('should return correct street2 address value', () => {
        const selector = new AddressSelectorAU(getGoogleAutocompletePlaceMock());

        expect(selector.getStreet2()).toBe('');
    });
});
