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

const mockSessionToken = {} as google.maps.places.AutocompleteSessionToken;

const mockPlacesLibrary = {
    AutocompleteSuggestion: {
        fetchAutocompleteSuggestions: jest.fn().mockResolvedValue({ suggestions: mockSuggestions }),
    },
    AutocompleteSessionToken: jest.fn().mockImplementation(() => mockSessionToken),
} as unknown as google.maps.PlacesLibrary;

const mockScriptLoader = {
    loadPlacesLibrary: jest.fn().mockResolvedValue(mockPlacesLibrary),
} as unknown as GoogleAutocompleteScriptLoader;

const mockPlaceDetailsResponse = {
    addressComponents: [
        { longText: 'New South Wales', shortText: 'NSW', types: ['administrative_area_level_1'] },
        { longText: 'Australia', shortText: 'AU', types: ['country'] },
    ],
    displayName: { text: '123 Main St' },
};

describe('GoogleAutocompleteService', () => {
    let service: GoogleAutocompleteService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new GoogleAutocompleteService('test-api-key', mockScriptLoader);

        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue(mockPlaceDetailsResponse),
        } as unknown as Response);
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
        it('fetches from the Places REST API with the correct URL and field mask', async () => {
            await service.getPlaceDetails('place-1', ['addressComponents', 'displayName']);

            expect(global.fetch).toHaveBeenCalledWith(
                'https://places.googleapis.com/v1/places/place-1?key=test-api-key',
                expect.objectContaining({
                    headers: { 'X-Goog-FieldMask': 'addressComponents,displayName' },
                }),
            );
        });

        it('uses default fields when none provided', async () => {
            await service.getPlaceDetails('place-1');

            expect(global.fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: { 'X-Goog-FieldMask': 'addressComponents,displayName' },
                }),
            );
        });

        it('maps addressComponents to the legacy GeocoderAddressComponent shape', async () => {
            const result = await service.getPlaceDetails('place-1');

            expect(result.address_components).toEqual([
                { long_name: 'New South Wales', short_name: 'NSW', types: ['administrative_area_level_1'] },
                { long_name: 'Australia', short_name: 'AU', types: ['country'] },
            ]);
        });

        it('maps displayName to the name field', async () => {
            const result = await service.getPlaceDetails('place-1');

            expect(result.name).toBe('123 Main St');
        });

        it('resets the session token after getPlaceDetails so the next session gets a fresh token', async () => {
            await service.getSuggestions('123 Main', ['address']);
            await service.getPlaceDetails('place-1', ['addressComponents']);
            await service.getSuggestions('456 Oak', ['address']);

            expect(mockPlacesLibrary.AutocompleteSessionToken).toHaveBeenCalledTimes(2);
        });

        it('throws when the REST API returns a non-ok status', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 403,
            } as unknown as Response);

            await expect(service.getPlaceDetails('place-1')).rejects.toThrow(
                'Places API request failed with status 403',
            );
        });
    });
});
