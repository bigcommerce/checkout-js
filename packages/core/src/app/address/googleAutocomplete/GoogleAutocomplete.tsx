import { noop } from 'lodash';
import React from 'react';

import { Autocomplete, type AutocompleteItem } from '@bigcommerce/checkout/ui';

import { type GoogleAutocompleteOptionTypes } from './googleAutocompleteTypes';
import { useGoogleAutocomplete } from './useGoogleAutocomplete';
import './GoogleAutocomplete.scss';

export { resetNewGooglePlacesApiState } from './useGoogleAutocomplete';

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
    const { items, autoComplete, handleSelect, handleChange } = useGoogleAutocomplete({
        apiKey,
        fields,
        nextElement,
        isAutocompleteEnabled,
        isNewPlacesApiEnabled,
        types,
        componentRestrictions,
        onSelect,
        onChange,
    });

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
