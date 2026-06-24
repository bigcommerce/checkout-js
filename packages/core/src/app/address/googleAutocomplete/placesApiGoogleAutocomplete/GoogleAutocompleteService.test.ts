import { type GoogleAutocompleteScriptLoader } from './GoogleAutocompleteScriptLoader';
import { GoogleAutocompleteService } from './GoogleAutocompleteService';

const mockSuggestions = [
    {
        placePrediction: {
            placeId: 'place-1',
            text: { text: '123 Main St, NY', matches: [] },
            mainText: { text: '123 Main St' },
        },
    },
] as unknown as google.maps.places.AutocompleteSuggestion[];

const mockPlace = {
    fetchFields: jest.fn().mockResolvedValue(undefined),
    addressComponents: [],
    displayName: '123 Main St',
} as unknown as google.maps.places.Place;

const mockSessionToken = {} as google.maps.places.AutocompleteSessionToken;

const mockPlacesLibrary = {
    AutocompleteSuggestion: {
        fetchAutocompleteSuggestions: jest.fn().mockResolvedValue({ suggestions: mockSuggestions }),
    },
    AutocompleteSessionToken: jest.fn().mockImplementation(() => mockSessionToken),
    Place: jest.fn().mockImplementation(() => mockPlace),
} as unknown as google.maps.PlacesLibrary;

const mockScriptLoader = {
    loadPlacesLibrary: jest.fn().mockResolvedValue(mockPlacesLibrary),
} as unknown as GoogleAutocompleteScriptLoader;

describe('GoogleAutocompleteService', () => {
    let service: GoogleAutocompleteService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new GoogleAutocompleteService('test-api-key', mockScriptLoader);
    });

    describe('#getSuggestions()', () => {
        it('returns suggestions mapped to AutocompleteItems', async () => {
            const result = await service.getSuggestions('123 Main', ['address']);

            expect(result).toHaveLength(1);
            expect(result[0]).toMatchObject({ id: 'place-1', label: '123 Main St, NY' });
        });

        it('passes input and mapped types to fetchAutocompleteSuggestions', async () => {
            await service.getSuggestions('123 Main', ['address']);

            expect(
                mockPlacesLibrary.AutocompleteSuggestion.fetchAutocompleteSuggestions,
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    input: '123 Main',
                    includedPrimaryTypes: ['street_address'],
                }),
            );
        });

        it('maps a string country restriction to includedRegionCodes array', async () => {
            await service.getSuggestions('123 Main', ['address'], { country: 'US' });

            expect(
                mockPlacesLibrary.AutocompleteSuggestion.fetchAutocompleteSuggestions,
            ).toHaveBeenCalledWith(expect.objectContaining({ includedRegionCodes: ['US'] }));
        });

        it('maps an array country restriction to includedRegionCodes', async () => {
            await service.getSuggestions('123 Main', ['address'], { country: ['US', 'CA'] });

            expect(
                mockPlacesLibrary.AutocompleteSuggestion.fetchAutocompleteSuggestions,
            ).toHaveBeenCalledWith(expect.objectContaining({ includedRegionCodes: ['US', 'CA'] }));
        });

        it('omits includedRegionCodes when no componentRestrictions provided', async () => {
            await service.getSuggestions('123 Main', ['address']);

            expect(
                mockPlacesLibrary.AutocompleteSuggestion.fetchAutocompleteSuggestions,
            ).toHaveBeenCalledWith(expect.objectContaining({ includedRegionCodes: undefined }));
        });

        it('creates a session token on the first call and passes it to the API', async () => {
            await service.getSuggestions('123 Main', ['address']);

            expect(mockPlacesLibrary.AutocompleteSessionToken).toHaveBeenCalledTimes(1);
            expect(
                mockPlacesLibrary.AutocompleteSuggestion.fetchAutocompleteSuggestions,
            ).toHaveBeenCalledWith(expect.objectContaining({ sessionToken: mockSessionToken }));
        });

        it('reuses the same session token across multiple calls', async () => {
            await service.getSuggestions('1', ['address']);
            await service.getSuggestions('12', ['address']);
            await service.getSuggestions('123', ['address']);

            expect(mockPlacesLibrary.AutocompleteSessionToken).toHaveBeenCalledTimes(1);
        });
    });

    describe('#getPlaceDetails()', () => {
        it('constructs a Place with the given placeId', async () => {
            await service.getPlaceDetails('place-1', ['addressComponents', 'displayName']);

            expect(mockPlacesLibrary.Place).toHaveBeenCalledWith({ id: 'place-1' });
        });

        it('calls fetchFields with the given fields and the active session token', async () => {
            await service.getSuggestions('123 Main', ['address']);
            await service.getPlaceDetails('place-1', ['addressComponents', 'displayName']);

            expect(mockPlace.fetchFields).toHaveBeenCalledWith({
                fields: ['addressComponents', 'displayName'],
                sessionToken: mockSessionToken,
            });
        });

        it('calls fetchFields with no session token if getSuggestions was never called', async () => {
            await service.getPlaceDetails('place-1', ['addressComponents', 'displayName']);

            expect(mockPlace.fetchFields).toHaveBeenCalledWith({
                fields: ['addressComponents', 'displayName'],
                sessionToken: undefined,
            });
        });

        it('resets the session token after getPlaceDetails so the next session gets a fresh token', async () => {
            await service.getSuggestions('123 Main', ['address']);
            await service.getPlaceDetails('place-1', ['addressComponents']);

            // Start a new typing session
            await service.getSuggestions('456 Oak', ['address']);

            expect(mockPlacesLibrary.AutocompleteSessionToken).toHaveBeenCalledTimes(2);
        });

        it('returns place details mapped to PlaceResult', async () => {
            const result = await service.getPlaceDetails('place-1', [
                'addressComponents',
                'displayName',
            ]);

            expect(result).toEqual({
                address_components: [],
                name: '123 Main St',
            });
        });

        it('uses default fields when none provided', async () => {
            await service.getPlaceDetails('place-1');

            expect(mockPlace.fetchFields).toHaveBeenCalledWith(
                expect.objectContaining({ fields: ['addressComponents', 'displayName'] }),
            );
        });
    });
});
