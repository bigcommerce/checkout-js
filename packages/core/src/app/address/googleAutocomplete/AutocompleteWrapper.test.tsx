import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen, waitFor } from '@bigcommerce/checkout/test-utils';

import AutocompleteWrapper, { newGooglePlacesApiState } from './AutocompleteWrapper';
import { type GoogleAutocompleteProps } from './GoogleAutocomplete';
import LegacyGoogleAutocompleteService from './GoogleAutocompleteService';
import { NewGooglePlacesApiService } from './newGooglePlacesApi/NewGooglePlacesApiService';

jest.mock('./GoogleAutocompleteService');
jest.mock('./newGooglePlacesApi/NewGooglePlacesApiService');

const MockLegacyService = LegacyGoogleAutocompleteService as jest.MockedClass<
    typeof LegacyGoogleAutocompleteService
>;
const MockPlacesApiService = NewGooglePlacesApiService as jest.MockedClass<
    typeof NewGooglePlacesApiService
>;

const legacySuggestions = [
    {
        description: '123 Legacy St, New York',
        structured_formatting: { main_text: '123 Legacy St' },
        matched_substrings: [],
        place_id: 'legacy-place-1',
    },
];

const legacyPlaceResult = {
    name: '123 Legacy St',
    address_components: [],
} as google.maps.places.PlaceResult;

const newApiSuggestions = [
    { id: 'new-place-1', label: '123 New API Ave', value: '123 New API Ave' },
];

const newApiPlaceResult = {
    name: '123 New API Ave',
    address_components: [],
} as google.maps.places.PlaceResult;

describe('AutocompleteWrapper', () => {
    let mockGetPlacePredictions: jest.Mock;
    let mockGetDetails: jest.Mock;
    let mockGetSuggestions: jest.Mock;
    let mockGetPlaceDetails: jest.Mock;
    let defaultProps: GoogleAutocompleteProps;

    beforeEach(() => {
        newGooglePlacesApiState.isUnavailable = false;

        mockGetPlacePredictions = jest.fn();
        mockGetDetails = jest.fn();
        mockGetSuggestions = jest.fn().mockResolvedValue(newApiSuggestions);
        mockGetPlaceDetails = jest.fn().mockResolvedValue(newApiPlaceResult);

        MockLegacyService.mockImplementation(
            () =>
                ({
                    getAutocompleteService: jest
                        .fn()
                        .mockResolvedValue({ getPlacePredictions: mockGetPlacePredictions }),
                    getPlacesServices: jest.fn().mockResolvedValue({ getDetails: mockGetDetails }),
                }) as unknown as LegacyGoogleAutocompleteService,
        );

        MockPlacesApiService.mockImplementation(
            () =>
                ({
                    getSuggestions: mockGetSuggestions,
                    getPlaceDetails: mockGetPlaceDetails,
                }) as unknown as NewGooglePlacesApiService,
        );

        defaultProps = {
            apiKey: 'test-api-key',
            isAutocompleteEnabled: true,
            onSelect: jest.fn(),
            onChange: jest.fn(),
        };
    });

    describe('new API available (preferred path)', () => {
        it('shows suggestions from the new API', async () => {
            render(<AutocompleteWrapper {...defaultProps} />);

            await userEvent.type(screen.getByRole('textbox'), '123');

            await screen.findByText('123 New API Ave');
            expect(mockGetPlacePredictions).not.toHaveBeenCalled();
        });

        it('debounces rapid keystrokes into a single new API request', async () => {
            render(<AutocompleteWrapper {...defaultProps} />);

            await userEvent.type(screen.getByRole('textbox'), '123');

            await screen.findByText('123 New API Ave');

            // Three characters, one request — for the full final value.
            expect(mockGetSuggestions).toHaveBeenCalledTimes(1);
            expect(mockGetSuggestions).toHaveBeenCalledWith('123', undefined, undefined);
        });

        it('calls onSelect with the new API place result when a suggestion is picked', async () => {
            render(<AutocompleteWrapper {...defaultProps} />);

            await userEvent.type(screen.getByRole('textbox'), '123');
            await screen.findByText('123 New API Ave');
            await userEvent.click(screen.getByText('123 New API Ave'));

            await waitFor(() =>
                expect(defaultProps.onSelect).toHaveBeenCalledWith(
                    newApiPlaceResult,
                    expect.objectContaining({ id: 'new-place-1' }),
                ),
            );
            expect(mockGetDetails).not.toHaveBeenCalled();
        });
    });

    describe('new API unavailable (fall back to legacy)', () => {
        beforeEach(() => {
            mockGetPlacePredictions.mockImplementation((_req, cb) => cb(legacySuggestions, 'OK'));
            mockGetDetails.mockImplementation((_req, cb) => cb(legacyPlaceResult, 'OK'));
        });

        it('falls back to the legacy service for suggestions when the new API rejects', async () => {
            mockGetSuggestions.mockRejectedValue(new Error('new API down'));

            render(<AutocompleteWrapper {...defaultProps} />);

            await userEvent.type(screen.getByRole('textbox'), '123');

            await screen.findByText('123 Legacy St, New York');
            expect(mockGetPlacePredictions).toHaveBeenCalled();
        });

        it('skips the new API on later input once it has failed', async () => {
            mockGetSuggestions.mockRejectedValue(new Error('new API down'));

            render(<AutocompleteWrapper {...defaultProps} />);

            const input = screen.getByRole('textbox');

            // First debounced request hits the new API, fails, and flips the fallback flag.
            await userEvent.type(input, '1');
            await screen.findByText('123 Legacy St, New York');
            expect(mockGetSuggestions).toHaveBeenCalledTimes(1);

            // A later request goes straight to legacy without retrying the new API.
            await userEvent.type(input, '2');
            await waitFor(() => expect(mockGetPlacePredictions).toHaveBeenCalledTimes(2));
            expect(mockGetSuggestions).toHaveBeenCalledTimes(1);
        });

        it('falls back to the legacy service for place details when the new API rejects', async () => {
            // Suggestions still come from the new API so the dropdown has an item to click,
            // but getPlaceDetails rejects, forcing the legacy getDetails fallback.
            mockGetPlaceDetails.mockRejectedValue(new Error('new API down'));

            render(<AutocompleteWrapper {...defaultProps} />);

            await userEvent.type(screen.getByRole('textbox'), '1');
            await screen.findByText('123 New API Ave');
            await userEvent.click(screen.getByText('123 New API Ave'));

            await waitFor(() =>
                expect(defaultProps.onSelect).toHaveBeenCalledWith(
                    legacyPlaceResult,
                    expect.objectContaining({ id: 'new-place-1' }),
                ),
            );
            expect(mockGetDetails).toHaveBeenCalled();
        });
    });
});
