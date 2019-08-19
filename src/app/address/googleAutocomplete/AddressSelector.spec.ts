import { getGoogleAutocompletePlaceMock } from './googleAutocompleteResult.mock';
import AddressSelector from './AddressSelector';

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
    });

    describe('#getStreet()', () => {
        it('returns the correct street', () => {
            const accessor = new AddressSelector(googleAutoCompleteResponseMock);
            expect(accessor.getStreet()).toBe('1-3 Smail St');
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
    });

    describe('#getCity()', () => {
        it('returns the postal town as city if present', () => {
            const accessor = new AddressSelector(googleAutoCompleteResponseMock);
            expect(accessor.getCity()).toBe('Ultimo PT (l)');
        });

        it('returns the locality as city if no postal town', () => {
            // tslint:disable-next-line:no-non-null-assertion
            const addressComponents = googleAutoCompleteResponseMock.address_components!
                .filter(address => !address.types.includes('postal_town'));

            const accessor = new AddressSelector({
                ...googleAutoCompleteResponseMock,
                address_components: addressComponents,
            });

            expect(accessor.getCity()).toBe('Ultimo (l)');
        });

        it('returns the neighborhood as city if nothing else is present', () => {
            // tslint:disable-next-line:no-non-null-assertion
            const addressComponents = googleAutoCompleteResponseMock.address_components!
                .filter(address => !address.types.includes('postal_town') && !address.types.includes('locality'));

            const accessor = new AddressSelector({
                ...googleAutoCompleteResponseMock,
                address_components: addressComponents,
            });

            expect(accessor.getCity()).toBe('Ultimo N');
        });
    });
});
