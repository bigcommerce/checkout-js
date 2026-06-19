import { noop } from 'lodash';
import React, { useRef, useState } from 'react';

import { Autocomplete, type AutocompleteItem } from '@bigcommerce/checkout/ui';

import GoogleAutocompleteService from './GoogleAutocompleteService';
import { type GoogleAutocompleteOptionTypes } from './googleAutocompleteTypes';
import { mapToAutocompleteItems, mapToGeocoderAddressComponent } from './utils';
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

    const handleSelect = (item: AutocompleteItem) => {
        const service = googleAutocompleteServiceRef.current;

        if (!service) return;

        service
            .getPlaceDetails(item.id, fields || ['addressComponents', 'displayName'])
            .then((place) => {
                const placeResult: google.maps.places.PlaceResult = {
                    address_components: place.addressComponents?.map(mapToGeocoderAddressComponent),
                    name: place.displayName ?? '',
                };

                if (nextElement) {
                    nextElement.focus();
                }

                onSelect(placeResult, item);
            })
            .catch(() => resetAutocomplete());
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

        service
            .getSuggestions(input, types || ['geocode'], componentRestrictions)
            .then((suggestions) => setItems(mapToAutocompleteItems(suggestions)))
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

export default GoogleAutocomplete;
