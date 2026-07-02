import { noop } from 'lodash';
import React, { useRef, useState } from 'react';

import { Autocomplete, type AutocompleteItem } from '@bigcommerce/checkout/ui';

import GoogleAutocompleteService from './GoogleAutocompleteService';
import { type GoogleAutocompleteOptionTypes } from './googleAutocompleteTypes';
import { NewGooglePlacesApiService } from './newGooglePlacesApi';
import { getNewGooglePlacesApiScriptLoader } from './newGooglePlacesApi/getNewGooglePlacesApiScriptLoader';
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

// module-scoped because we want to persist across all checkout steps
const newGooglePlacesApiState = { isUnavailable: false };

export function resetNewGooglePlacesApiState(): void {
    newGooglePlacesApiState.isUnavailable = false;
}

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
        // When the new Places API is enabled, the legacy service must share the same script-loader instance.
        // Otherwise Maps JS API that they depend on will be loaded twice and that breaks both services
        googleAutocompleteServiceRef.current = new GoogleAutocompleteService(
            apiKey,
            isNewPlacesApiEnabled ? getNewGooglePlacesApiScriptLoader() : undefined,
        );
    }

    const isUsingLegacyApi = !isNewPlacesApiEnabled || newGooglePlacesApiState.isUnavailable;

    const finalizeSelection = (
        place: google.maps.places.PlaceResult | null,
        item: AutocompleteItem,
    ) => {
        if (nextElement) {
            nextElement.focus();
        }

        onSelect(place, item);
    };

    const fetchSuggestionsWithLegacyApi = (input: string): void => {
        const service = googleAutocompleteServiceRef.current;

        if (!service) return;

        service.getAutocompleteService().then((autocompleteService) => {
            autocompleteService.getPlacePredictions(
                { input, types: types || ['geocode'], componentRestrictions },
                (results) => {
                    setItems(toAutocompleteItems(results ?? undefined));
                },
            );
        });
    };

    const fetchSuggestionsWithNewApi = (input: string): void => {
        const service = newGooglePlacesApiServiceRef.current;

        if (!service) return;

        service
            .getSuggestions(input, types, componentRestrictions)
            .then(setItems)
            .catch((error) => {
                if (isNewPlacesApiPermissionDenied(error)) {
                    newGooglePlacesApiState.isUnavailable = true;
                    fetchSuggestionsWithLegacyApi(input);
                }
            });
    };

    const selectWithLegacyApi = (item: AutocompleteItem): void => {
        const service = googleAutocompleteServiceRef.current;

        if (!service) return;

        service.getPlacesServices().then((placesService) => {
            placesService.getDetails(
                { placeId: item.id, fields: fields || ['address_components', 'name'] },
                (result) => {
                    finalizeSelection(result, item);
                },
            );
        });
    };

    const selectWithNewApi = (item: AutocompleteItem): void => {
        const service = newGooglePlacesApiServiceRef.current;

        if (!service) return;

        service
            .getPlaceDetails(item.id, fields)
            .then((result) => finalizeSelection(result, item))
            .catch((error) => {
                if (isNewPlacesApiPermissionDenied(error)) {
                    newGooglePlacesApiState.isUnavailable = true;
                    selectWithLegacyApi(item);
                }
            });
    };

    const handleSelect = (item: AutocompleteItem) => {
        if (isUsingLegacyApi) {
            selectWithLegacyApi(item);

            return;
        }

        selectWithNewApi(item);
    };

    const resetAutocomplete = (): void => {
        setItems([]);
        setAutoComplete('off');
    };

    const setAutocompleteValue = (input: string): void => {
        setAutoComplete(input && input.length ? 'nope' : 'off');
    };

    const fetchSuggestions = (input: string): void => {
        if (isUsingLegacyApi) {
            fetchSuggestionsWithLegacyApi(input);

            return;
        }

        fetchSuggestionsWithNewApi(input);
    };

    const handleChange = (input: string) => {
        onChange(input, false);

        if (!isAutocompleteEnabled) {
            return resetAutocomplete();
        }

        setAutocompleteValue(input);

        if (!input) {
            setItems([]);

            return;
        }

        fetchSuggestions(input);
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
            onChange={handleChange}
            onSelect={handleSelect}
            onToggleOpen={onToggleOpen}
        >
            <div className="co-googleAutocomplete-footer" />
        </Autocomplete>
    );
};

export default GoogleAutocomplete;
