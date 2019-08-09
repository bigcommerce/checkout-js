import { noop } from 'lodash';
import React, { Component, ReactNode } from 'react';

import { Autocomplete, AutocompleteItem } from '../../ui/autocomplete';

import { GoogleAutocompleteOptionTypes } from './googleAutocompleteTypes';
import './GoogleAutocomplete.scss';
import GoogleAutocompleteService from './GoogleAutocompleteService';

interface GoogleAutocompleteProps {
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

class GoogleAutocomplete extends Component<GoogleAutocompleteProps, GoogleAutocompleteState> {
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
        const {
            initialValue,
            onToggleOpen = noop,
            inputProps = {},
        } = this.props;
        const { items } = this.state;

        return (
            <Autocomplete
                listTestId="address-autocomplete-suggestions"
                items={ items }
                initialHighlightedIndex={ 0 }
                inputProps={ {
                    ...inputProps,
                    autoComplete: this.state.autoComplete,
                } }
                initialValue={ initialValue }
                onSelect={ this.onSelect }
                onChange={ this.onChange }
                onToggleOpen={ onToggleOpen }
            >
                <div className="co-googleAutocomplete-footer"></div>
            </Autocomplete>
        );
    }

    private onSelect: (item: AutocompleteItem) => void = item => {
        const {
            onSelect = noop,
            nextElement,
        } = this.props;

        this.googleAutocompleteService.getPlacesServices().then(service => {
            service.getDetails({
                placeId: item.id,
                fields: this.props.fields || ['address_components', 'name'],
            }, result => {
                if (nextElement) {
                    nextElement.focus();
                }

                onSelect(result, item);
            });
        });
    };

    private onChange: (input: string) => void = input => {
        const {
            isAutocompleteEnabled,
            onChange = noop,
        } = this.props;

        onChange(input);

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

        this.googleAutocompleteService.getAutocompleteService().then(service => {
            service.getPlacePredictions({
                input,
                types: this.props.types || ['geocode'],
                componentRestrictions: this.props.componentRestrictions,
            }, results =>
                this.setState({ items: this.toAutocompleteItems(results) })
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

    private toAutocompleteItems(results?: google.maps.places.AutocompletePrediction[]): AutocompleteItem[] {
        return (results || []).map(result => ({
            label: result.description,
            value: result.structured_formatting.main_text,
            highlightedSlices: result.matched_substrings,
            id: result.place_id,
        }));
    }
}

export default GoogleAutocomplete;
