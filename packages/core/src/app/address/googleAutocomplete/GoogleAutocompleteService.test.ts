import { type GoogleAutocompleteScriptLoader } from './GoogleAutocompleteScriptLoader';
import GoogleAutocompleteService from './GoogleAutocompleteService';

const mockSuggestions = [
    { placePrediction: { placeId: 'place-1' } },
] as google.maps.places.AutocompleteSuggestion[];

const mockPlace = {
    fetchFields: jest.fn().mockResolvedValue(undefined),
    addressComponents: [],
    displayName: '123 Main St',
} as google.maps.places.Place;

const mockPlacesLibrary = {
    AutocompleteSuggestion: {
        fetchAutocompleteSuggestions: jest.fn().mockResolvedValue({ suggestions: mockSuggestions }),
    },
    Place: jest.fn().mockImplementation(() => mockPlace),
} as google.maps.PlacesLibrary;

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
        it('returns suggestions from the API', async () => {
            const result = await service.getSuggestions('123 Main', ['address']);

            expect(result).toBe(mockSuggestions);
        });

        it('passes input and types to fetchAutocompleteSuggestions', async () => {
            await service.getSuggestions('123 Main', ['address']);

            expect(
                mockPlacesLibrary.AutocompleteSuggestion.fetchAutocompleteSuggestions,
            ).toHaveBeenCalledWith(
                expect.objectContaining({ input: '123 Main', includedPrimaryTypes: ['address'] }),
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
    });

    describe('#getPlaceDetails()', () => {
        it('constructs a Place with the given placeId', async () => {
            await service.getPlaceDetails('place-1', ['addressComponents', 'displayName']);

            expect(mockPlacesLibrary.Place).toHaveBeenCalledWith({ id: 'place-1' });
        });

        it('calls fetchFields with the given fields', async () => {
            await service.getPlaceDetails('place-1', ['addressComponents', 'displayName']);

            expect(mockPlace.fetchFields).toHaveBeenCalledWith({
                fields: ['addressComponents', 'displayName'],
            });
        });

        it('returns the place after fetching fields', async () => {
            const result = await service.getPlaceDetails('place-1', ['addressComponents']);

            expect(result).toBe(mockPlace);
        });
    });
});
