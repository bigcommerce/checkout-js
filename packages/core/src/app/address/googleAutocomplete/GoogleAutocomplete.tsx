import { debounce, noop } from 'lodash';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { Autocomplete, type AutocompleteItem } from '@bigcommerce/checkout/ui';

import GoogleAutocompleteService from './GoogleAutocompleteService';
import { type GoogleAutocompleteOptionTypes } from './googleAutocompleteTypes';
import { getNewGooglePlacesApiScriptLoader, NewGooglePlacesApiService } from './newGooglePlacesApi';
import { isNewPlacesApiPermissionDenied } from './newGooglePlacesApi/utils';
import './GoogleAutocomplete.scss';

export interface GoogleAutocompleteProps {
    initialValue?: string;
    componentRestrictions?: google.maps.places.ComponentRestrictions;
    fields?: string[];
    apiKey: string;
    nextElement?: HTMLElement;
    inputProps?: any;
    isAutocompleteEnabled?: boolean;
    isNewPlacesApiEnabled?: boolean;
    types?: GoogleAutocompleteOptionTypes[];
    onSelect?(place: google.maps.places.PlaceResult, item: AutocompleteItem): void;
    onToggleOpen?(state: { inputValue: string; isOpen: boolean }): void;
    onChange?(value: string, isOpen: boolean): void;
}

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

export const newGooglePlacesApiState = { isUnavailable: false };

const SUGGESTIONS_DEBOUNCE_MS = 300;

const GoogleAutocomplete: React.FC<GoogleAutocompleteProps> = ({
    initialValue,
    onToggleOpen = noop,
    inputProps = {},
    fields,
    onSelect = noop,
    nextElement,
    isAutocompleteEnabled,
    isNewPlacesApiEnabled = false,
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
        // When the new Places API is enabled, the legacy service must share the same
        // script-loader instance as NewGooglePlacesApiService (rather than loading the Maps
        // JS API a second time via the old loader), so its permission-denied fallback stays
        // reliable for stores whose API key doesn't yet support the new Places API.
        googleAutocompleteServiceRef.current = new GoogleAutocompleteService(
            apiKey,
            isNewPlacesApiEnabled ? getNewGooglePlacesApiScriptLoader() : undefined,
        );
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

    const handleFetchLegacySuggestions = (input: string): void => {
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

    const handleFetchNewApiSuggestions = (input: string): void => {
        newGooglePlacesApiServiceRef
            .current!.getSuggestions(input, types, componentRestrictions)
            .then(setItems)
            .catch((error) => {
                if (isNewPlacesApiPermissionDenied(error)) {
                    newGooglePlacesApiState.isUnavailable = true;
                    handleFetchLegacySuggestions(input);
                }
            });
    };

    const handleSelectViaLegacy = (item: AutocompleteItem): void => {
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

    const handleSelectViaNewApi = (item: AutocompleteItem): void => {
        newGooglePlacesApiServiceRef
            .current!.getPlaceDetails(item.id, fields)
            .then((result) => finalizeSelection(result, item))
            .catch((error) => {
                if (isNewPlacesApiPermissionDenied(error)) {
                    newGooglePlacesApiState.isUnavailable = true;
                    handleSelectViaLegacy(item);
                }
            });
    };

    const onSelectHandler = (item: AutocompleteItem) => {
        if (!isNewPlacesApiEnabled || newGooglePlacesApiState.isUnavailable) {
            handleSelectViaLegacy(item);

            return;
        }

        handleSelectViaNewApi(item);
    };

    const resetAutocomplete = (): void => {
        setItems([]);
        setAutoComplete('off');
    };

    const setAutocompleteValue = (input: string): void => {
        setAutoComplete(input && input.length ? 'nope' : 'off');
    };

    const fetchSuggestions = (input: string): void => {
        if (!isNewPlacesApiEnabled || newGooglePlacesApiState.isUnavailable) {
            handleFetchLegacySuggestions(input);

            return;
        }

        handleFetchNewApiSuggestions(input);
    };

    const fetchSuggestionsRef = useRef(fetchSuggestions);

    fetchSuggestionsRef.current = fetchSuggestions;

    // using ref to make sure the function is always up to date
    const debouncedFetchSuggestions = useMemo(
        () =>
            debounce(
                (input: string) => fetchSuggestionsRef.current(input),
                SUGGESTIONS_DEBOUNCE_MS,
            ),
        [],
    );

    // cleanup debounce on component unmount
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

export default GoogleAutocomplete;
