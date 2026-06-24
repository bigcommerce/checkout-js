import { noop } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';

import { Autocomplete, type AutocompleteItem } from '@bigcommerce/checkout/ui';

import GoogleAutocompleteService from './GoogleAutocompleteService';
import { type GoogleAutocompleteOptionTypes } from './googleAutocompleteTypes';
import { GoogleAutocompleteService as PlacesApiGoogleAutocompleteService } from './placesApiGoogleAutocomplete/GoogleAutocompleteService';
import './GoogleAutocomplete.scss';

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
    const placesApiServiceRef = useRef<PlacesApiGoogleAutocompleteService>();
    const isLegacyUnavailableRef = useRef(false);
    const currentInputRef = useRef<string>('');

    if (!googleAutocompleteServiceRef.current) {
        googleAutocompleteServiceRef.current = new GoogleAutocompleteService(apiKey);
    }

    if (!placesApiServiceRef.current) {
        placesApiServiceRef.current = new PlacesApiGoogleAutocompleteService(apiKey);
    }

    // gm_authFailure fires when the Maps JS SDK processes an auth error asynchronously
    // (e.g. ApiTargetBlockedMapError for keys without legacy Places API access).
    // In that case getPlacePredictions' callback never fires, so we detect the failure
    // here and immediately retry the current input against the new Places API.
    useEffect(() => {
        const win = window as Window & { gm_authFailure?: () => void };
        const prev = win.gm_authFailure;

        win.gm_authFailure = () => {
            win.gm_authFailure = prev;
            isLegacyUnavailableRef.current = true;

            if (currentInputRef.current) {
                placesApiServiceRef
                    .current!.getSuggestions(currentInputRef.current, types, componentRestrictions)
                    .then(setItems)
                    .catch(noop);
            }
        };

        return () => {
            win.gm_authFailure = prev;
        };
    }, []);

    const onSelectHandler = (item: AutocompleteItem) => {
        if (isLegacyUnavailableRef.current) {
            placesApiServiceRef.current!.getPlaceDetails(item.id, fields).then((result) => {
                if (nextElement) {
                    nextElement.focus();
                }

                onSelect(result, item);
            });

            return;
        }

        googleAutocompleteServiceRef.current!
            .getPlacesServices()
            .then((placesService) => {
                placesService.getDetails(
                    { placeId: item.id, fields: fields || ['address_components', 'name'] },
                    (result, status) => {
                        if (status === 'REQUEST_DENIED') {
                            isLegacyUnavailableRef.current = true;
                            placesApiServiceRef.current!
                                .getPlaceDetails(item.id, fields)
                                .then((newResult) => {
                                    if (nextElement) {
                                        nextElement.focus();
                                    }

                                    onSelect(newResult, item);
                                });

                            return;
                        }

                        if (nextElement) {
                            nextElement.focus();
                        }

                        onSelect(result, item);
                    },
                );
            })
            .catch(() => {
                isLegacyUnavailableRef.current = true;
                placesApiServiceRef.current!.getPlaceDetails(item.id, fields).then((result) => {
                    if (nextElement) {
                        nextElement.focus();
                    }

                    onSelect(result, item);
                });
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

        if (isLegacyUnavailableRef.current) {
            placesApiServiceRef.current!
                .getSuggestions(input, types, componentRestrictions)
                .then(setItems);

            return;
        }

        service
            .getAutocompleteService()
            .then((autocompleteService) => {
                autocompleteService.getPlacePredictions(
                    { input, types: types || ['geocode'], componentRestrictions },
                    (results, status) => {
                        if (status === 'REQUEST_DENIED') {
                            isLegacyUnavailableRef.current = true;
                            placesApiServiceRef.current!
                                .getSuggestions(input, types, componentRestrictions)
                                .then(setItems);

                            return;
                        }

                        setItems(toAutocompleteItems(results ?? undefined));
                    },
                );
            })
            .catch(() => {
                isLegacyUnavailableRef.current = true;
                placesApiServiceRef.current!
                    .getSuggestions(input, types, componentRestrictions)
                    .then(setItems);
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
