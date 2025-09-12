import { noop } from 'lodash';
import React, { useRef, useState } from 'react';

import { Autocomplete, type AutocompleteItem } from '../../ui/autocomplete';

import GoogleAutocompleteService from './GoogleAutocompleteService';
import { type GoogleAutocompleteOptionTypes } from './googleAutocompleteTypes';
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

    if (!googleAutocompleteServiceRef.current) {
        googleAutocompleteServiceRef.current = new GoogleAutocompleteService(apiKey);
    }

    const onSelectHandler = (item: AutocompleteItem) => {
        const service = googleAutocompleteServiceRef.current;
        
        if (!service) return;

        service.getPlacesServices().then((placesService) => {
            placesService.getDetails(
                {
                    placeId: item.id,
                    fields: fields || ['address_components', 'name'],
                },
                (result) => {
                    if (nextElement) {
                        nextElement.focus();
                    }

                    onSelect(result, item);
                },
            );
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
        
        if (!service) return;

        service.getAutocompleteService().then((autocompleteService) => {
            autocompleteService.getPlacePredictions(
                {
                    input,
                    types: types || ['geocode'],
                    componentRestrictions,
                },
                (results) => {
                    const autocompleteItems = toAutocompleteItems(results ?? undefined);

                    setItems(autocompleteItems);
                }
            );
        });
    };

    const onChangeHandler = (input: string) => {
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
