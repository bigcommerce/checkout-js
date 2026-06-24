import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen, waitFor } from '@bigcommerce/checkout/test-utils';

import GoogleAutocomplete, { type GoogleAutocompleteProps } from './GoogleAutocomplete';
import LegacyGoogleAutocompleteService from './GoogleAutocompleteService';
import { GoogleAutocompleteService as PlacesApiService } from './placesApiGoogleAutocomplete/GoogleAutocompleteService';

jest.mock('./GoogleAutocompleteService');
jest.mock('./placesApiGoogleAutocomplete/GoogleAutocompleteService');

const MockLegacyService = LegacyGoogleAutocompleteService as jest.MockedClass<
    typeof LegacyGoogleAutocompleteService
>;
const MockPlacesApiService = PlacesApiService as jest.MockedClass<typeof PlacesApiService>;

const legacySuggestions = [
    {
        description: '123 Legacy St, New York',
        structured_formatting: { main_text: '123 Legacy St' },
        matched_substrings: [],
        place_id: 'legacy-place-1',
    },
] as unknown as google.maps.places.AutocompletePrediction[];

const legacyPlaceResult = {
    name: '123 Legacy St',
    address_components: [],
} as google.maps.places.PlaceResult;

const newApiSuggestions = [{ id: 'new-place-1', label: '123 New API Ave', value: '123 New API Ave' }];

const newApiPlaceResult = {
    name: '123 New API Ave',
    address_components: [],
} as google.maps.places.PlaceResult;

describe('GoogleAutocomplete', () => {
    let mockGetPlacePredictions: jest.Mock;
    let mockGetDetails: jest.Mock;
    let mockGetSuggestions: jest.Mock;
    let mockGetPlaceDetails: jest.Mock;
    let defaultProps: GoogleAutocompleteProps;

    beforeEach(() => {
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
                    getPlacesServices: jest
                        .fn()
                        .mockResolvedValue({ getDetails: mockGetDetails }),
                }) as unknown as LegacyGoogleAutocompleteService,
        );

        MockPlacesApiService.mockImplementation(
            () =>
                ({
                    getSuggestions: mockGetSuggestions,
                    getPlaceDetails: mockGetPlaceDetails,
                }) as unknown as PlacesApiService,
        );

        defaultProps = {
            apiKey: 'test-api-key',
            isAutocompleteEnabled: true,
            onSelect: jest.fn(),
            onChange: jest.fn(),
        };
    });

    describe('legacy API available (existing customers)', () => {
        beforeEach(() => {
            mockGetPlacePredictions.mockImplementation((_req, cb) =>
                cb(legacySuggestions, 'OK'),
            );
            mockGetDetails.mockImplementation((_req, cb) => cb(legacyPlaceResult, 'OK'));
        });

        it('shows suggestions from the legacy service', async () => {
            render(<GoogleAutocomplete {...defaultProps} />);

            await userEvent.type(screen.getByRole('textbox'), '123');

            await waitFor(() =>
                expect(screen.getByText('123 Legacy St, New York')).toBeInTheDocument(),
            );
            expect(mockGetSuggestions).not.toHaveBeenCalled();
        });

        it('calls onSelect with the legacy place result when a suggestion is picked', async () => {
            render(<GoogleAutocomplete {...defaultProps} />);

            await userEvent.type(screen.getByRole('textbox'), '123');
            await waitFor(() =>
                expect(screen.getByText('123 Legacy St, New York')).toBeInTheDocument(),
            );
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

    describe('legacy API unavailable (new customers)', () => {
        beforeEach(() => {
            mockGetPlacePredictions.mockImplementation((_req, cb) =>
                cb(null, 'REQUEST_DENIED'),
            );
            mockGetDetails.mockImplementation((_req, cb) => cb(null, 'REQUEST_DENIED'));
        });

        it('falls back to the new API for suggestions on REQUEST_DENIED', async () => {
            render(<GoogleAutocomplete {...defaultProps} />);

            await userEvent.type(screen.getByRole('textbox'), '123');

            await waitFor(() =>
                expect(screen.getByText('123 New API Ave')).toBeInTheDocument(),
            );
            expect(mockGetSuggestions).toHaveBeenCalledWith(
                expect.stringContaining('123'),
                undefined,
                undefined,
            );
        });

        it('skips the legacy service on subsequent keystrokes after REQUEST_DENIED', async () => {
            render(<GoogleAutocomplete {...defaultProps} />);

            await userEvent.type(screen.getByRole('textbox'), '12');

            await waitFor(() => expect(mockGetSuggestions).toHaveBeenCalledTimes(2));

            // Both characters triggered the new API; legacy was only tried once (on '1')
            expect(mockGetPlacePredictions).toHaveBeenCalledTimes(1);
        });

        it('falls back to the new API for place details on REQUEST_DENIED', async () => {
            // Return OK for suggestions so the dropdown has an item to click,
            // but REQUEST_DENIED for getDetails (set in beforeEach).
            mockGetPlacePredictions.mockImplementation((_req, cb) =>
                cb(legacySuggestions, 'OK'),
            );

            render(<GoogleAutocomplete {...defaultProps} />);

            // Type a single character so only one getPlacePredictions call fires
            await userEvent.type(screen.getByRole('textbox'), '1');
            await waitFor(() =>
                expect(screen.getByText('123 Legacy St, New York')).toBeInTheDocument(),
            );
            await userEvent.click(screen.getByText('123 Legacy St, New York'));

            await waitFor(() =>
                expect(defaultProps.onSelect).toHaveBeenCalledWith(
                    newApiPlaceResult,
                    expect.objectContaining({ id: 'legacy-place-1' }),
                ),
            );
            expect(mockGetPlaceDetails).toHaveBeenCalledWith('legacy-place-1', undefined);
        });
    });
});
