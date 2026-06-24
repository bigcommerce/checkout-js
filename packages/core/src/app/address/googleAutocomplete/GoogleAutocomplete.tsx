import { noop } from 'lodash';
import React, { useRef, useState } from 'react';

import { Autocomplete, type AutocompleteItem } from '@bigcommerce/checkout/ui';

import type { IGoogleAutocompleteService } from './IGoogleAutocompleteService';
import { GoogleAutocompleteService as PlacesNewService } from './placesNew/GoogleAutocompleteService';
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
    /**
     * Override the autocomplete backend. Defaults to the Places API (New) implementation.
     * Pass `new GoogleAutocompleteService(apiKey)` (legacy) to use the old Places API.
     */
    service?: IGoogleAutocompleteService;
    onSelect?(place: google.maps.places.PlaceResult, item: AutocompleteItem): void;
    onToggleOpen?(state: { inputValue: string; isOpen: boolean }): void;
    onChange?(value: string, isOpen: boolean): void;
}

export const GoogleAutocomplete: React.FC<GoogleAutocompleteProps> = ({
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
    service,
}) => {
    const [items, setItems] = useState<AutocompleteItem[]>([]);
    const [autoComplete, setAutoComplete] = useState<string>('off');
    const serviceRef = useRef<IGoogleAutocompleteService>();

    if (!serviceRef.current) {
        serviceRef.current = service ?? new PlacesNewService(apiKey);
    }

    const handleSelect = (item: AutocompleteItem) => {
        const svc = serviceRef.current;

        if (!svc) return;

        svc.getPlaceDetails(item.id, fields)
            .then((placeResult) => {
                if (nextElement) {
                    nextElement.focus();
                }

                onSelect(placeResult, item);
            })
            .catch(() => {
                // keep user suggestion text if api call fails
                onSelect({ name: item.label }, item);
                resetAutocomplete();
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

        const svc = serviceRef.current;

        if (!svc) return;

        svc.getSuggestions(input, types, componentRestrictions)
            .then((suggestions) => setItems(suggestions))
            .catch(() => setItems([]));
    };

    const handleChange = (input: string) => {
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
            onChange={handleChange}
            onSelect={handleSelect}
            onToggleOpen={onToggleOpen}
        >
            <div className="co-googleAutocomplete-footer" />
        </Autocomplete>
    );
};
