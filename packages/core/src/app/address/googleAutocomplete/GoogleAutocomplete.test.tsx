import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen, waitFor } from '@bigcommerce/checkout/test-utils';

import GoogleAutocomplete, {
    type GoogleAutocompleteProps,
    resetNewGooglePlacesApiState,
} from './GoogleAutocomplete';
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

const gRpcPermissionDeniedErrorMock = { name: 'RpcError', code: 7 };
const gRpcSomeOtherErrorMock = { name: 'RpcError', code: 14 };

describe('GoogleAutocomplete', () => {
    let mockGetPlacePredictions: jest.Mock;
    let mockGetDetails: jest.Mock;
    let mockGetSuggestions: jest.Mock;
    let mockGetPlaceDetails: jest.Mock;
    let defaultProps: GoogleAutocompleteProps;

    beforeEach(() => {
        resetNewGooglePlacesApiState();

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
            isNewPlacesApiEnabled: true,
            onSelect: jest.fn(),
            onChange: jest.fn(),
        };
    });

    describe('new API available (preferred path)', () => {
        it('shows suggestions from the new API', async () => {
            render(<GoogleAutocomplete {...defaultProps} />);

            await userEvent.type(screen.getByRole('textbox'), '123');

            await screen.findByText('123 New API Ave');
            expect(mockGetPlacePredictions).not.toHaveBeenCalled();
        });

        it('calls onSelect with the new API place result when a suggestion is picked', async () => {
            render(<GoogleAutocomplete {...defaultProps} />);

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

        it('falls back to the legacy service for suggestions when the new API is denied', async () => {
            mockGetSuggestions.mockRejectedValue(gRpcPermissionDeniedErrorMock);

            render(<GoogleAutocomplete {...defaultProps} />);

            await userEvent.type(screen.getByRole('textbox'), '123');

            await screen.findByText('123 Legacy St, New York');
            expect(mockGetPlacePredictions).toHaveBeenCalled();
        });

        it('does not fall back to legacy for a non-permission suggestions failure', async () => {
            mockGetSuggestions.mockRejectedValue(gRpcSomeOtherErrorMock);

            render(<GoogleAutocomplete {...defaultProps} />);

            await userEvent.type(screen.getByRole('textbox'), '123');

            await waitFor(() => expect(mockGetSuggestions).toHaveBeenCalled());
            expect(screen.queryByText('123 Legacy St, New York')).not.toBeInTheDocument();
            expect(mockGetPlacePredictions).not.toHaveBeenCalled();
        });

        it('latches onto legacy after a permission denial and stops retrying the new API', async () => {
            mockGetSuggestions.mockRejectedValue(gRpcPermissionDeniedErrorMock);

            render(<GoogleAutocomplete {...defaultProps} />);

            const input = screen.getByRole('textbox');

            // First request hits the new API, is denied, and latches the fallback flag.
            await userEvent.type(input, '1');
            await screen.findByText('123 Legacy St, New York');
            expect(mockGetSuggestions).toHaveBeenCalledTimes(1);

            // A later request goes straight to legacy without retrying the new API.
            await userEvent.type(input, '2');
            await waitFor(() => expect(mockGetPlacePredictions).toHaveBeenCalledTimes(2));
            expect(mockGetSuggestions).toHaveBeenCalledTimes(1);
        });

        it('keeps retrying the new API on later input after a transient failure, without falling back', async () => {
            mockGetSuggestions.mockRejectedValue(gRpcSomeOtherErrorMock);

            render(<GoogleAutocomplete {...defaultProps} />);

            const input = screen.getByRole('textbox');

            // First request fails transiently; no fallback and no latch, since it's not a permission denial.
            await userEvent.type(input, '1');
            await waitFor(() => expect(mockGetSuggestions).toHaveBeenCalledTimes(1));
            expect(mockGetPlacePredictions).not.toHaveBeenCalled();

            // The new API is tried again on the next input, since the failure was not permanent.
            await userEvent.type(input, '2');
            await waitFor(() => expect(mockGetSuggestions).toHaveBeenCalledTimes(2));
        });

        it('falls back to the legacy service for place details when the new API denies permission', async () => {
            // Suggestions still come from the new API so the dropdown has an item to click,
            // but getPlaceDetails is denied, forcing the legacy getDetails fallback.
            mockGetPlaceDetails.mockRejectedValue(gRpcPermissionDeniedErrorMock);

            render(<GoogleAutocomplete {...defaultProps} />);

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

        it('does not fall back to legacy for a non-permission place details failure', async () => {
            mockGetPlaceDetails.mockRejectedValue(new Error('new API down'));

            render(<GoogleAutocomplete {...defaultProps} />);

            await userEvent.type(screen.getByRole('textbox'), '1');
            await screen.findByText('123 New API Ave');
            await userEvent.click(screen.getByText('123 New API Ave'));

            await waitFor(() => expect(mockGetPlaceDetails).toHaveBeenCalled());
            expect(mockGetDetails).not.toHaveBeenCalled();
            expect(defaultProps.onSelect).not.toHaveBeenCalled();
        });
    });

    describe('new API disabled via experiment flag', () => {
        beforeEach(() => {
            mockGetPlacePredictions.mockImplementation((_req, cb) => cb(legacySuggestions, 'OK'));
            mockGetDetails.mockImplementation((_req, cb) => cb(legacyPlaceResult, 'OK'));
        });

        it('goes straight to the legacy service for suggestions without calling the new API', async () => {
            render(<GoogleAutocomplete {...defaultProps} isNewPlacesApiEnabled={false} />);

            await userEvent.type(screen.getByRole('textbox'), '123');

            await screen.findByText('123 Legacy St, New York');
            expect(mockGetSuggestions).not.toHaveBeenCalled();
        });

        it('goes straight to the legacy service for place details without calling the new API', async () => {
            render(<GoogleAutocomplete {...defaultProps} isNewPlacesApiEnabled={false} />);

            await userEvent.type(screen.getByRole('textbox'), '1');
            await screen.findByText('123 Legacy St, New York');
            await userEvent.click(screen.getByText('123 Legacy St, New York'));

            await waitFor(() =>
                expect(defaultProps.onSelect).toHaveBeenCalledWith(
                    legacyPlaceResult,
                    expect.objectContaining({ id: 'legacy-place-1' }),
                ),
            );
            expect(mockGetPlaceDetails).not.toHaveBeenCalled();
        });
    });
});
