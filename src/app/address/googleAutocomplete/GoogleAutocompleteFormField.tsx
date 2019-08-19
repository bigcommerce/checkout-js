import { FormField as FormFieldType } from '@bigcommerce/checkout-sdk';
import React, { FunctionComponent } from 'react';

import { TranslatedString } from '../../locale';
import { AutocompleteItem } from '../../ui/autocomplete';
import { FormField } from '../../ui/form';
import { getFormFieldInputId } from '../getFormFieldInputId';

import GoogleAutocomplete from './GoogleAutocomplete';

export interface GoogleAutocompleteFormFieldProps {
    apiKey: string;
    field: FormFieldType;
    countryCode?: string;
    supportedCountries: string[];
    nextElement?: HTMLElement;
    parentFieldName?: string;
    onSelect(place: google.maps.places.PlaceResult, item: AutocompleteItem): void;
    onToggleOpen?(state: { inputValue: string; isOpen: boolean }): void;
    onChange(value: string, isOpen: boolean): void;
}

const GoogleAutocompleteFormField: FunctionComponent<GoogleAutocompleteFormFieldProps>  = ({
    field: {
        name,
    },
    countryCode,
    supportedCountries,
    parentFieldName,
    nextElement,
    apiKey,
    onSelect,
    onChange,
    onToggleOpen,
}) => {
    const fieldName = parentFieldName ? `${parentFieldName}.${name}` : name;

    return (
        <div className={ `dynamic-form-field dynamic-form-field--addressLineAutocomplete` }>
            <FormField
                name={ fieldName }
                labelContent={ <TranslatedString id="address.address_line_1_label" />}
                input={ ({ field }) =>
                    <GoogleAutocomplete
                        apiKey={ apiKey }
                        onSelect={ onSelect }
                        onChange={ onChange }
                        initialValue={ field.value }
                        nextElement={ nextElement }
                        onToggleOpen={ onToggleOpen }
                        isAutocompleteEnabled={ countryCode ?
                            supportedCountries.indexOf(countryCode) > -1 :
                            false
                        }
                        inputProps={ {
                            className: 'form-input optimizedCheckout-form-input',
                            id: getFormFieldInputId(name),
                        } }
                        componentRestrictions={ countryCode ?
                            { country: countryCode } :
                            undefined
                        }
                    />
                }
            />
        </div>
    );
};

export default GoogleAutocompleteFormField;
