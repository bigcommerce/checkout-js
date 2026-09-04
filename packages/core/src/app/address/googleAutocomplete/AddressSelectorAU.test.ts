import AddressSelectorAU from './AddressSelectorAU';
import { getGoogleAutocompletePlaceMock } from './googleAutocompleteResult.mock';

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

    it('upper-cases lowercase letter suffixes on the street number and subpremise per Australia Post', () => {
        const selector = new AddressSelectorAU({
            ...googleAutocompletePlaceMock,
            address_components: [
                {
                    long_name: 'unit 2a',
                    short_name: 'unit 2a',
                    types: ['subpremise'],
                },
                {
                    long_name: '34b',
                    short_name: '34b',
                    types: ['street_number'],
                },
                {
                    long_name: 'Bayford Street',
                    short_name: 'Bayford St',
                    types: ['route'],
                },
            ],
        });

        expect(selector.getStreet()).toBe('unit 2A/34B Bayford Street');
    });

    it('leaves ordinals and multi-letter endings in the subpremise unchanged', () => {
        const selector = new AddressSelectorAU({
            ...googleAutocompletePlaceMock,
            address_components: [
                {
                    long_name: '3rd floor',
                    short_name: '3rd floor',
                    types: ['subpremise'],
                },
                {
                    long_name: '34',
                    short_name: '34',
                    types: ['street_number'],
                },
                {
                    long_name: 'Bayford Street',
                    short_name: 'Bayford St',
                    types: ['route'],
                },
            ],
        });

        expect(selector.getStreet()).toBe('3rd floor/34 Bayford Street');
    });
});
