import { FormField as FormFieldType } from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import { FieldProps } from 'formik';
import React, { FunctionComponent, memo, useCallback, useMemo } from 'react';

import { TranslatedString } from '../../locale';
import { AutocompleteItem } from '../../ui/autocomplete';
import { FormField, Label } from '../../ui/form';
import {
    getAddressFormFieldInputId,
    getAddressFormFieldLabelId,
} from '../getAddressFormFieldInputId';

import GoogleAutocomplete from './GoogleAutocomplete';

export interface GoogleAutocompleteFormFieldProps {
    apiKey: string;
    field: FormFieldType;
    countryCode?: string;
    supportedCountries: string[];
    nextElement?: HTMLElement;
    parentFieldName?: string;
    useFloatingLabel?: boolean;
    onSelect(place: google.maps.places.PlaceResult, item: AutocompleteItem): void;
    onToggleOpen?(state: { inputValue: string; isOpen: boolean }): void;
    onChange(value: string, isOpen: boolean): void;
}

const GoogleAutocompleteFormField: FunctionComponent<GoogleAutocompleteFormFieldProps> = ({
    field: { default: placeholder, name },
    countryCode,
    supportedCountries,
    parentFieldName,
    nextElement,
    apiKey,
    onSelect,
    onChange,
    onToggleOpen,
    useFloatingLabel,
}) => {
    const fieldName = parentFieldName ? `${parentFieldName}.${name}` : name;

    const labelContent = useMemo(() => <TranslatedString id="address.address_line_1_label" />, []);

    const labelId = getAddressFormFieldLabelId(name);

    const inputProps = useMemo(
        () => ({
            className: classNames(
                'form-input optimizedCheckout-form-input',
                { 'floating-input': useFloatingLabel },
            ),
            id: getAddressFormFieldInputId(name),
            'aria-labelledby': labelId,
            placeholder: useFloatingLabel ? ' ' : placeholder,
            labelText: useFloatingLabel ? labelContent : null,
        }),
        [name, labelId, placeholder, labelContent],
    );

    const renderInput = useCallback(
        ({ field }: FieldProps) => (
            <GoogleAutocomplete
                apiKey={apiKey}
                componentRestrictions={countryCode ? { country: countryCode } : undefined}
                initialValue={field.value}
                inputProps={inputProps}
                isAutocompleteEnabled={
                    countryCode ? supportedCountries.indexOf(countryCode) > -1 : false
                }
                nextElement={nextElement}
                onChange={onChange}
                onSelect={onSelect}
                onToggleOpen={onToggleOpen}
            />
        ),
        [
            apiKey,
            countryCode,
            inputProps,
            nextElement,
            onChange,
            onSelect,
            onToggleOpen,
            supportedCountries,
        ],
    );

    const renderLabel = useFloatingLabel ? null : (
        <Label htmlFor={inputProps.id} id={labelId} useFloatingLabel={useFloatingLabel}>
            {labelContent}
        </Label>
    );

    return (
        <div className={classNames(
                'dynamic-form-field dynamic-form-field--addressLineAutocomplete',
                { 'floating-form-field': useFloatingLabel },
            )}
        >
            <FormField
                input={renderInput}
                label={renderLabel}
                name={fieldName}
                useFloatingLabel={useFloatingLabel}
            />
        </div>
    );
};

export default memo(GoogleAutocompleteFormField);
