import { noop } from 'lodash';
import React, { PureComponent, ReactNode } from 'react';

import { Autocomplete, AutocompleteItem } from '../../ui/autocomplete';

import { GoogleAutocompleteOptionTypes } from './googleAutocompleteTypes';
import './GoogleAutocomplete.scss';
import GoogleAutocompleteService from './GoogleAutocompleteService';

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

interface GoogleAutocompleteState {
    items: AutocompleteItem[];
    autoComplete: string;
}

class GoogleAutocomplete extends PureComponent<GoogleAutocompleteProps, GoogleAutocompleteState> {
    googleAutocompleteService: GoogleAutocompleteService;

    constructor(props: GoogleAutocompleteProps) {
        super(props);
        this.googleAutocompleteService = new GoogleAutocompleteService(props.apiKey);
        this.state = {
            items: [],
            autoComplete: 'off',
        };
    }

    render(): ReactNode {
        const { initialValue, onToggleOpen = noop, inputProps = {} } = this.props;

        const { autoComplete, items } = this.state;

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
                onChange={this.onChange}
                onSelect={this.onSelect}
                onToggleOpen={onToggleOpen}
            >
                <div className="co-googleAutocomplete-footer" />
            </Autocomplete>
        );
    }

    private onSelect: (item: AutocompleteItem) => void = (item) => {
        const { fields, onSelect = noop, nextElement } = this.props;

        this.googleAutocompleteService.getPlacesServices().then((service) => {
            service.getDetails(
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

    private onChange: (input: string) => void = (input) => {
        const { isAutocompleteEnabled, onChange = noop } = this.props;

        onChange(input, false);

        if (!isAutocompleteEnabled) {
            return this.resetAutocomplete();
        }

        this.setAutocomplete(input);
        this.setItems(input);
    };

    private setItems(input: string): void {
        if (!input) {
            this.setState({ items: [] });

            return;
        }

        const { componentRestrictions, types } = this.props;

        this.googleAutocompleteService.getAutocompleteService().then((service) => {
            service.getPlacePredictions(
                {
                    input,
                    types: types || ['geocode'],
                    componentRestrictions,
                },
                (results) => this.setState({ items: this.toAutocompleteItems(results) }),
            );
        });
    }

    private resetAutocomplete(): void {
        this.setState({
            items: [],
            autoComplete: 'off',
        });
    }

    private setAutocomplete(input: string): void {
        this.setState({
            ...this.state,
            autoComplete: input && input.length ? 'nope' : 'off',
        });
    }

    private toAutocompleteItems(
        results?: google.maps.places.AutocompletePrediction[],
    ): AutocompleteItem[] {
        return (results || []).map((result) => ({
            label: result.description,
            value: result.structured_formatting.main_text,
            highlightedSlices: result.matched_substrings,
            id: result.place_id,
        }));
    }
}

export default GoogleAutocomplete;
