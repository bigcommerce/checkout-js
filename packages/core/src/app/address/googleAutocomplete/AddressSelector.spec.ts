import AddressSelector from './AddressSelector';
import AddressSelectorFactory from "./AddressSelectorFactory";
import { getGoogleAutocompleteCAPlaceMockWithLocality, getGoogleAutocompleteCAPlaceMockWithSubLocality, getGoogleAutocompleteNZPlaceMock, getGoogleAutocompletePlaceMock, getGoogleAutocompleteUKPlaceMock } from './googleAutocompleteResult.mock';

describe('AddressSelector', () => {
    let googleAutoCompleteResponseMock: google.maps.places.PlaceResult;

    beforeEach(() => {
        googleAutoCompleteResponseMock = getGoogleAutocompletePlaceMock();
    });

    describe('constructor', () => {
        it('returns an instance of generic country accessor', () => {
            const accessor = new AddressSelector(googleAutoCompleteResponseMock);

            expect(accessor).toBeInstanceOf(AddressSelector);
        });
    });

    describe('#getState()', () => {
        it('returns the correct state', () => {
            const accessor = new AddressSelector(googleAutoCompleteResponseMock);

            expect(accessor.getState()).toBe('NSW');
        });

        it('does not return a state for a UK address', () => {
            googleAutoCompleteResponseMock = getGoogleAutocompleteUKPlaceMock();

            const accessor = AddressSelectorFactory.create(googleAutoCompleteResponseMock);

            expect(accessor.getState()).toBe('');
        });
    });

    describe('#getStreet()', () => {
        it('returns the correct street', () => {
            const accessor = new AddressSelector(googleAutoCompleteResponseMock);

            expect(accessor.getStreet()).toBe('1-3 Smail St');
        });
    });

    describe('#getStreet2()', () => {
        it('returns the correct street2 value', () => {
            const accessor = new AddressSelector(googleAutoCompleteResponseMock);

            expect(accessor.getStreet2()).toBe('unit 6');
        });

        it('returns the correct street2 value for NZ', () => {
            const googleAutoCompleteResponseMock = getGoogleAutocompleteNZPlaceMock();
            const accessor = new AddressSelector(googleAutoCompleteResponseMock);

            expect(accessor.getStreet()).toBe('6d/17 Alberton Avenue');
            expect(accessor.getStreet2()).toBe('Mount Albert');
        });
    });

    describe('#getCountry()', () => {
        it('returns the correct country', () => {
            const accessor = new AddressSelector(googleAutoCompleteResponseMock);

            expect(accessor.getCountry()).toBe('AU');
        });
    });

    describe('#getPostCode()', () => {
        it('returns the correct post code', () => {
            const accessor = new AddressSelector(googleAutoCompleteResponseMock);

            expect(accessor.getPostCode()).toBe('2007');
        });

        it('does not return a post code for an UK address', () => {
            googleAutoCompleteResponseMock = getGoogleAutocompleteUKPlaceMock();

            const accessor = AddressSelectorFactory.create(googleAutoCompleteResponseMock);

            expect(accessor.getPostCode()).toBe('');
        });
    });

    describe('#getCity()', () => {
        it('returns the postal town as city if present', () => {
            const accessor = new AddressSelector(googleAutoCompleteResponseMock);

            expect(accessor.getCity()).toBe('Ultimo PT (l)');
        });

        it('returns the locality as city if no postal town', () => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const addressComponents = googleAutoCompleteResponseMock.address_components!.filter(
                (address) => !address.types.includes('postal_town'),
            );

            const accessor = new AddressSelector({
                ...googleAutoCompleteResponseMock,
                address_components: addressComponents,
            });

            expect(accessor.getCity()).toBe('Ultimo (l)');
        });

        it('returns the neighborhood as city if nothing else is present', () => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const addressComponents = googleAutoCompleteResponseMock.address_components!.filter(
                (address) =>
                    !address.types.includes('postal_town') && !address.types.includes('locality'),
            );

            const accessor = new AddressSelector({
                ...googleAutoCompleteResponseMock,
                address_components: addressComponents,
            });

            expect(accessor.getCity()).toBe('Ultimo N');
        });

        it('resturns the correct city for canada when sublocality is present', () => {
            googleAutoCompleteResponseMock = getGoogleAutocompleteCAPlaceMockWithSubLocality();

            const accessor = AddressSelectorFactory.create(googleAutoCompleteResponseMock);

            expect(accessor.getCity()).toBe('Gloucester');
        });

        it('resturns the correct city for canada when sublocality is not present', () => {
            googleAutoCompleteResponseMock = getGoogleAutocompleteCAPlaceMockWithLocality();

            const accessor = AddressSelectorFactory.create(googleAutoCompleteResponseMock);

            expect(accessor.getCity()).toBe('Calgary');
        });
    });
});
