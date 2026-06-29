import { noop } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';

import { Autocomplete, type AutocompleteItem } from '@bigcommerce/checkout/ui';

import GoogleAutocompleteService from './GoogleAutocompleteService';
import { type GoogleAutocompleteOptionTypes } from './googleAutocompleteTypes';
import { NewGooglePlacesApiService } from './newGooglePlacesApi';
import './GoogleAutocomplete.scss';

declare global {
    interface Window {
        // Global hook the Google Maps JS SDK invokes when it processes an auth error.
        gm_authFailure?: () => void;
    }
}

export interface GoogleAutocompleteProps {
    initialValue?: string;
    componentRestrictions?: google.maps.places.ComponentRestrictions;
    fields?: string[];
    apiKey: string;
    nextElement?: HTMLElement;
    inputProps?: any;
    isAutocompleteEnabled?: boolean;
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

export const legacyAutocompleteState = { isUnavailable: false };

const GoogleAutocomplete: React.FC<GoogleAutocompleteProps> = ({
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
    const googleAutocompleteServiceRef = useRef<GoogleAutocompleteService>();
    const newGooglePlacesApiServiceRef = useRef<NewGooglePlacesApiService>();
    const currentInputRef = useRef<string>('');

    // Track the latest values so the long-lived gm_authFailure handler (installed once,
    // below) always reads current props rather than the values captured at mount.
    const typesRef = useRef(types);
    const componentRestrictionsRef = useRef(componentRestrictions);

    typesRef.current = types;
    componentRestrictionsRef.current = componentRestrictions;

    if (!googleAutocompleteServiceRef.current) {
        googleAutocompleteServiceRef.current = new GoogleAutocompleteService(apiKey);
    }

    if (!newGooglePlacesApiServiceRef.current) {
        newGooglePlacesApiServiceRef.current = new NewGooglePlacesApiService(apiKey);
    }

    // this is to catch errors in legacy Autocomplete SDK
    useEffect(() => {
        const prev = window.gm_authFailure;

        window.gm_authFailure = () => {
            window.gm_authFailure = prev;
            legacyAutocompleteState.isUnavailable = true;

            if (currentInputRef.current) {
                newGooglePlacesApiServiceRef
                    .current!.getSuggestions(
                        currentInputRef.current,
                        typesRef.current,
                        componentRestrictionsRef.current,
                    )
                    .then(setItems)
                    .catch(noop);
            }
        };

        return () => {
            window.gm_authFailure = prev;
        };
    }, []);

    const finalizeSelection = (
        place: google.maps.places.PlaceResult | null,
        item: AutocompleteItem,
    ) => {
        if (nextElement) {
            nextElement.focus();
        }

        onSelect(place, item);
    };

    const selectViaNewApi = (item: AutocompleteItem) =>
        newGooglePlacesApiServiceRef
            .current!.getPlaceDetails(item.id, fields)
            .then((result) => finalizeSelection(result, item))
            .catch(noop);

    const onSelectHandler = (item: AutocompleteItem) => {
        if (legacyAutocompleteState.isUnavailable) {
            void selectViaNewApi(item);

            return;
        }

        googleAutocompleteServiceRef
            .current!.getPlacesServices()
            .then((placesService) => {
                placesService.getDetails(
                    { placeId: item.id, fields: fields || ['address_components', 'name'] },
                    (result, status) => {
                        if (status === 'REQUEST_DENIED') {
                            legacyAutocompleteState.isUnavailable = true;
                            void selectViaNewApi(item);

                            return;
                        }

                        finalizeSelection(result, item);
                    },
                );
            })
            .catch(() => {
                legacyAutocompleteState.isUnavailable = true;
                void selectViaNewApi(item);
            });
    };

    const resetAutocomplete = (): void => {
        setItems([]);
        setAutoComplete('off');
    };

    const setAutocompleteValue = (input: string): void => {
        setAutoComplete(input && input.length ? 'nope' : 'off');
    };

    const setItemsFromInput = (input: string): void => {
        if (!input) {
            setItems([]);

            return;
        }

        const service = googleAutocompleteServiceRef.current;

        if (!service) {
            return;
        }

        if (legacyAutocompleteState.isUnavailable) {
            newGooglePlacesApiServiceRef
                .current!.getSuggestions(input, types, componentRestrictions)
                .then(setItems)
                .catch(noop);

            return;
        }

        service
            .getAutocompleteService()
            .then((autocompleteService) => {
                autocompleteService.getPlacePredictions(
                    { input, types: types || ['geocode'], componentRestrictions },
                    (results, status) => {
                        if (status === 'REQUEST_DENIED') {
                            legacyAutocompleteState.isUnavailable = true;
                            newGooglePlacesApiServiceRef
                                .current!.getSuggestions(input, types, componentRestrictions)
                                .then(setItems)
                                .catch(noop);

                            return;
                        }

                        setItems(toAutocompleteItems(results ?? undefined));
                    },
                );
            })
            .catch(() => {
                legacyAutocompleteState.isUnavailable = true;
                newGooglePlacesApiServiceRef
                    .current!.getSuggestions(input, types, componentRestrictions)
                    .then(setItems)
                    .catch(noop);
            });
    };

    const onChangeHandler = (input: string) => {
        currentInputRef.current = input;
        onChange(input, false);

        if (!isAutocompleteEnabled) {
            return resetAutocomplete();
        }

        setAutocompleteValue(input);
        setItemsFromInput(input);
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
