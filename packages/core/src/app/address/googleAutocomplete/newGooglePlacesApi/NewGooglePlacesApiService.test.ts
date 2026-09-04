import { type NewGooglePlacesApiScriptLoader } from './NewGooglePlacesApiScriptLoader';
import { NewGooglePlacesApiService } from './NewGooglePlacesApiService';

const mockPlaceAddressComponents = [
    { longText: 'New South Wales', shortText: 'NSW', types: ['administrative_area_level_1'] },
    { longText: 'Australia', shortText: 'AU', types: ['country'] },
];

const mockFetchFields = jest.fn().mockResolvedValue(undefined);

const mockPlaceFromPrediction = {
    fetchFields: mockFetchFields,
    addressComponents: mockPlaceAddressComponents,
    displayName: '123 Main St',
};

const mockToPlace = jest.fn().mockReturnValue(mockPlaceFromPrediction);

const mockSuggestions = [
    {
        placePrediction: {
            placeId: 'place-1',
            text: { text: '123 Main St, NY', matches: [] },
            mainText: { text: '123 Main St' },
            toPlace: mockToPlace,
        },
    },
];

const MockPlace = jest.fn().mockImplementation(({ id }: { id: string }) => ({
    id,
    fetchFields: mockFetchFields,
    addressComponents: mockPlaceAddressComponents,
    displayName: '123 Main St',
}));

const MockSessionToken = jest.fn().mockImplementation(() => ({}));

const mockPlacesLibrary = {
    AutocompleteSuggestion: {
        fetchAutocompleteSuggestions: jest.fn().mockResolvedValue({ suggestions: mockSuggestions }),
    },
    AutocompleteSessionToken: MockSessionToken,
    Place: MockPlace,
};

const mockScriptLoader = {
    loadPlacesLibrary: jest.fn().mockResolvedValue(mockPlacesLibrary),
} as unknown as NewGooglePlacesApiScriptLoader;

describe('NewGooglePlacesApiService', () => {
    let service: NewGooglePlacesApiService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new NewGooglePlacesApiService('test-api-key', mockScriptLoader);
    });

    describe('getSuggestions', () => {
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
    });

    describe('getPlaceDetails', () => {
        it('fetches place details via the SDK with the mapped field mask', async () => {
            await service.getPlaceDetails('place-1', ['addressComponents', 'displayName']);

            expect(MockPlace).toHaveBeenCalledWith({ id: 'place-1' });
            expect(mockFetchFields).toHaveBeenCalledWith({
                fields: ['addressComponents', 'displayName'],
            });
        });

        it('translates legacy snake_case field names into SDK field names', async () => {
            await service.getPlaceDetails('place-1', ['address_components', 'name']);

            expect(mockFetchFields).toHaveBeenCalledWith({
                fields: ['addressComponents', 'displayName'],
            });
        });

        it('uses default fields when none provided', async () => {
            await service.getPlaceDetails('place-1');

            expect(mockFetchFields).toHaveBeenCalledWith({
                fields: ['addressComponents', 'displayName'],
            });
        });

        it('maps addressComponents to the legacy GeocoderAddressComponent shape', async () => {
            const result = await service.getPlaceDetails('place-1');

            expect(result.address_components).toEqual([
                {
                    long_name: 'New South Wales',
                    short_name: 'NSW',
                    types: ['administrative_area_level_1'],
                },
                { long_name: 'Australia', short_name: 'AU', types: ['country'] },
            ]);
        });

        it('maps displayName to the name field', async () => {
            const result = await service.getPlaceDetails('place-1');

            expect(result.name).toBe('123 Main St');
        });

        it('rejects when fetchFields fails', async () => {
            mockFetchFields.mockRejectedValueOnce(new Error('Maps JS auth failed'));

            await expect(service.getPlaceDetails('place-1')).rejects.toThrow('Maps JS auth failed');
        });

        it('falls back to a tokenless Place lookup when no matching prediction is cached', async () => {
            await service.getPlaceDetails('unknown-place');

            expect(MockPlace).toHaveBeenCalledWith({ id: 'unknown-place' });
            expect(mockToPlace).not.toHaveBeenCalled();
        });
    });

    describe('session tokens', () => {
        it('creates a session token and passes it to fetchAutocompleteSuggestions', async () => {
            await service.getSuggestions('123 Main', ['address']);

            expect(MockSessionToken).toHaveBeenCalledTimes(1);
            expect(
                mockPlacesLibrary.AutocompleteSuggestion.fetchAutocompleteSuggestions,
            ).toHaveBeenCalledWith(expect.objectContaining({ sessionToken: expect.any(Object) }));
        });

        it('reuses the same token across keystrokes within one session', async () => {
            await service.getSuggestions('1', ['address']);
            await service.getSuggestions('12', ['address']);

            expect(MockSessionToken).toHaveBeenCalledTimes(1);

            const { calls } =
                mockPlacesLibrary.AutocompleteSuggestion.fetchAutocompleteSuggestions.mock;

            expect(calls[0][0].sessionToken).toBe(calls[1][0].sessionToken);
        });

        it('concludes the session via the prediction toPlace() and starts a fresh token next time', async () => {
            await service.getSuggestions('123 Main', ['address']);

            const result = await service.getPlaceDetails('place-1');

            // Resolved through the cached prediction, not a freshly constructed Place.
            expect(mockToPlace).toHaveBeenCalledTimes(1);
            expect(MockPlace).not.toHaveBeenCalled();
            expect(result.name).toBe('123 Main St');

            // The next address entry opens a brand-new session.
            await service.getSuggestions('456 Oak', ['address']);

            expect(MockSessionToken).toHaveBeenCalledTimes(2);
        });
    });
});
