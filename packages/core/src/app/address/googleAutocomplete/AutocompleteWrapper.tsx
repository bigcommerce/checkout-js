import { debounce, noop } from 'lodash';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { Autocomplete, type AutocompleteItem } from '@bigcommerce/checkout/ui';

import { type GoogleAutocompleteProps } from './GoogleAutocomplete';
import GoogleAutocompleteService from './GoogleAutocompleteService';
import { NewGooglePlacesApiService } from './newGooglePlacesApi';
import './GoogleAutocomplete.scss';

const toAutocompleteItems = (
    results?: google.maps.places.AutocompletePrediction[],
): AutocompleteItem[] => {
    return (results || []).map((result) => ({
        label: result.description,
        value: result.structured_formatting.main_text,
        highlightedSlices: result.matched_substrings,
        id: result.place_id,
    }));
};

// Tracks whether the new Places API has failed for this session so we can stop
// retrying it and fall back to the legacy SDK for the remainder of the session.
export const newGooglePlacesApiState = { isUnavailable: false };

// Wait after the last keystroke before requesting suggestions. Avoids firing (and being
// billed/throttled for) a request per character, and stops a fast burst of keystrokes from
// each launching a new-API request before the first failure can flip the fallback flag.
const SUGGESTIONS_DEBOUNCE_MS = 300;

const AutocompleteWrapper: React.FC<GoogleAutocompleteProps> = ({
    initialValue,
    onToggleOpen = noop,
    inputProps = {},
    fields,
    onSelect = noop,
    nextElement,
    isAutocompleteEnabled,
    onChange = noop,
    componentRestrictions,
    types,
    apiKey,
}) => {
    const [items, setItems] = useState<AutocompleteItem[]>([]);
    const [autoComplete, setAutoComplete] = useState<string>('off');
    const newGooglePlacesApiServiceRef = useRef<NewGooglePlacesApiService>();
    const googleAutocompleteServiceRef = useRef<GoogleAutocompleteService>();

    if (!newGooglePlacesApiServiceRef.current) {
        newGooglePlacesApiServiceRef.current = new NewGooglePlacesApiService(apiKey);
    }

    if (!googleAutocompleteServiceRef.current) {
        googleAutocompleteServiceRef.current = new GoogleAutocompleteService(apiKey);
    }

    const finalizeSelection = (
        place: google.maps.places.PlaceResult | null,
        item: AutocompleteItem,
    ) => {
        if (nextElement) {
            nextElement.focus();
        }

        onSelect(place, item);
    };

    // Legacy fallbacks ---------------------------------------------------------

    const getLegacySuggestions = (input: string): void => {
        googleAutocompleteServiceRef
            .current!.getAutocompleteService()
            .then((autocompleteService) => {
                autocompleteService.getPlacePredictions(
                    { input, types: types || ['geocode'], componentRestrictions },
                    (results) => {
                        setItems(toAutocompleteItems(results ?? undefined));
                    },
                );
            })
            .catch(noop);
    };

    const selectViaLegacy = (item: AutocompleteItem): void => {
        googleAutocompleteServiceRef
            .current!.getPlacesServices()
            .then((placesService) => {
                placesService.getDetails(
                    { placeId: item.id, fields: fields || ['address_components', 'name'] },
                    (result) => {
                        finalizeSelection(result, item);
                    },
                );
            })
            .catch(noop);
    };

    // New Places API (preferred) ----------------------------------------------

    const getNewApiSuggestions = (input: string): void => {
        newGooglePlacesApiServiceRef
            .current!.getSuggestions(input, types, componentRestrictions)
            .then(setItems)
            .catch(() => {
                newGooglePlacesApiState.isUnavailable = true;
                getLegacySuggestions(input);
            });
    };

    const selectViaNewApi = (item: AutocompleteItem): void => {
        newGooglePlacesApiServiceRef
            .current!.getPlaceDetails(item.id, fields)
            .then((result) => finalizeSelection(result, item))
            .catch(() => {
                newGooglePlacesApiState.isUnavailable = true;
                selectViaLegacy(item);
            });
    };

    // Handlers -----------------------------------------------------------------

    const onSelectHandler = (item: AutocompleteItem) => {
        if (newGooglePlacesApiState.isUnavailable) {
            selectViaLegacy(item);

            return;
        }

        selectViaNewApi(item);
    };

    const resetAutocomplete = (): void => {
        setItems([]);
        setAutoComplete('off');
    };

    const setAutocompleteValue = (input: string): void => {
        setAutoComplete(input && input.length ? 'nope' : 'off');
    };

    const fetchSuggestions = (input: string): void => {
        if (newGooglePlacesApiState.isUnavailable) {
            getLegacySuggestions(input);

            return;
        }

        getNewApiSuggestions(input);
    };

    // Keep a stable debounced function across renders while always invoking the latest
    // fetchSuggestions closure (which reads current props/state) via the ref.
    const fetchSuggestionsRef = useRef(fetchSuggestions);

    fetchSuggestionsRef.current = fetchSuggestions;

    const debouncedFetchSuggestions = useMemo(
        () =>
            debounce(
                (input: string) => fetchSuggestionsRef.current(input),
                SUGGESTIONS_DEBOUNCE_MS,
            ),
        [],
    );

    useEffect(() => () => debouncedFetchSuggestions.cancel(), [debouncedFetchSuggestions]);

    const onChangeHandler = (input: string) => {
        onChange(input, false);

        if (!isAutocompleteEnabled) {
            debouncedFetchSuggestions.cancel();

            return resetAutocomplete();
        }

        setAutocompleteValue(input);

        // Clearing the field should empty the list immediately, not after the debounce.
        if (!input) {
            debouncedFetchSuggestions.cancel();
            setItems([]);

            return;
        }

        debouncedFetchSuggestions(input);
    };

    return (
        <Autocomplete
            defaultHighlightedIndex={-1}
            initialHighlightedIndex={-1}
            initialValue={initialValue}
            inputProps={{
                ...inputProps,
                autoComplete,
            }}
            items={items}
            listTestId="address-autocomplete-suggestions"
            onChange={onChangeHandler}
            onSelect={onSelectHandler}
            onToggleOpen={onToggleOpen}
        >
            <div className="co-googleAutocomplete-footer" />
        </Autocomplete>
    );
};

export default AutocompleteWrapper;
