import { useRef, useState } from 'react';

import { type AutocompleteItem } from '@bigcommerce/checkout/ui';

import GoogleAutocompleteService from './GoogleAutocompleteService';
import { type GoogleAutocompleteOptionTypes } from './googleAutocompleteTypes';
import { NewGooglePlacesApiService } from './newGooglePlacesApi';
import { getNewGooglePlacesApiScriptLoader } from './newGooglePlacesApi/getNewGooglePlacesApiScriptLoader';
import { isNewPlacesApiPermissionDenied } from './newGooglePlacesApi/utils';
import { toAutocompleteItems } from './utils';

export interface UseGoogleAutocompleteProps {
    apiKey: string;
    fields?: string[];
    nextElement?: HTMLElement;
    isAutocompleteEnabled?: boolean;
    isNewPlacesApiEnabled: boolean;
    types?: GoogleAutocompleteOptionTypes[];
    componentRestrictions?: google.maps.places.ComponentRestrictions;
    onSelect(place: google.maps.places.PlaceResult | null, item: AutocompleteItem): void;
    onChange(value: string, isOpen: boolean): void;
}

export interface UseGoogleAutocompleteResult {
    items: AutocompleteItem[];
    autoComplete: string;
    handleSelect(item: AutocompleteItem): void;
    handleChange(input: string): void;
}

// module-scoped because we want to persist across all checkout steps
const newGooglePlacesApiState = { isUnavailable: false };

export function resetNewGooglePlacesApiState(): void {
    newGooglePlacesApiState.isUnavailable = false;
}

export function useGoogleAutocomplete({
    apiKey,
    fields,
    nextElement,
    isAutocompleteEnabled,
    isNewPlacesApiEnabled,
    types,
    componentRestrictions,
    onSelect,
    onChange,
}: UseGoogleAutocompleteProps): UseGoogleAutocompleteResult {
    const [items, setItems] = useState<AutocompleteItem[]>([]);
    const [autoComplete, setAutoComplete] = useState<string>('off');
    const newGooglePlacesApiServiceRef = useRef<NewGooglePlacesApiService>();
    const googleAutocompleteServiceRef = useRef<GoogleAutocompleteService>();
    const newApiInputRef = useRef<string>();

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

    const isUsingLegacyApi = () => !isNewPlacesApiEnabled || newGooglePlacesApiState.isUnavailable;

    const finalizeSelection = (
        place: google.maps.places.PlaceResult | null,
        item: AutocompleteItem,
    ) => {
        if (nextElement) {
            nextElement.focus();
        }

        onSelect(place, item);
    };

    const legacyApi = {
        fetchSuggestions: (input: string): void => {
            const service = googleAutocompleteServiceRef.current;

            if (!service) {
                return;
            }

            service.getAutocompleteService().then((autocompleteService) => {
                autocompleteService.getPlacePredictions(
                    { input, types: types || ['geocode'], componentRestrictions },
                    (results) => {
                        setItems(toAutocompleteItems(results ?? undefined));
                    },
                );
            });
        },
        select: (item: AutocompleteItem): void => {
            const service = googleAutocompleteServiceRef.current;

            if (!service) {
                return;
            }

            service.getPlacesServices().then((placesService) => {
                placesService.getDetails(
                    { placeId: item.id, fields: fields || ['address_components', 'name'] },
                    (result) => {
                        finalizeSelection(result, item);
                    },
                );
            });
        },
    };

    const newApi = {
        fetchSuggestions: (input: string): void => {
            const service = newGooglePlacesApiServiceRef.current;

            if (!service) {
                return;
            }

            newApiInputRef.current = input;

            service
                .getSuggestions(input, types, componentRestrictions)
                .then((results) => {
                    if (newApiInputRef.current === input) {
                        setItems(results);
                    }
                })
                .catch((error) => {
                    if (isNewPlacesApiPermissionDenied(error)) {
                        newGooglePlacesApiState.isUnavailable = true;

                        if (newApiInputRef.current === input) {
                            legacyApi.fetchSuggestions(input);
                        }

                        return;
                    }

                    if (newApiInputRef.current === input) {
                        setItems([]);
                    }
                });
        },
        select: (item: AutocompleteItem): void => {
            const service = newGooglePlacesApiServiceRef.current;

            if (!service) {
                return;
            }

            service
                .getPlaceDetails(item.id, fields)
                .then((result) => finalizeSelection(result, item))
                .catch((error) => {
                    if (isNewPlacesApiPermissionDenied(error)) {
                        newGooglePlacesApiState.isUnavailable = true;
                        legacyApi.select(item);
                    }
                });
        },
    };

    const handleSelect = (item: AutocompleteItem) => {
        if (isUsingLegacyApi()) {
            legacyApi.select(item);

            return;
        }

        newApi.select(item);
    };

    const resetAutocomplete = (): void => {
        setItems([]);
        setAutoComplete('off');
    };

    const setAutocompleteValue = (input: string): void => {
        setAutoComplete(input && input.length ? 'nope' : 'off');
    };

    const fetchSuggestions = (input: string): void => {
        if (isUsingLegacyApi()) {
            legacyApi.fetchSuggestions(input);

            return;
        }

        newApi.fetchSuggestions(input);
    };

    const handleChange = (input: string) => {
        onChange(input, false);

        if (!isAutocompleteEnabled) {
            resetAutocomplete();

            return;
        }

        setAutocompleteValue(input);

        if (!input) {
            newApiInputRef.current = input;
            setItems([]);

            return;
        }

        fetchSuggestions(input);
    };

    return { items, autoComplete, handleSelect, handleChange };
}
