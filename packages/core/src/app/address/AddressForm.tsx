import { type Address, type Country, type FormField } from '@bigcommerce/checkout-sdk';
import { forIn, noop } from 'lodash';
import React, { useCallback, useContext, useEffect, useRef } from 'react';

import { TranslatedString, useLocale } from '@bigcommerce/checkout/locale';
import { DynamicFormField, DynamicFormFieldType, ThemeContext } from '@bigcommerce/checkout/ui';

import { type AutocompleteItem } from '../ui/autocomplete';
import { CheckboxFormField, Fieldset } from '../ui/form';

import { type AddressKeyMap } from './address';
import {
    getAddressFormFieldInputId,
    getAddressFormFieldLegacyName,
} from './getAddressFormFieldInputId';
import { GoogleAutocompleteFormField, mapToAddress } from './googleAutocomplete';
import './AddressForm.scss';

export interface AddressFormProps {
    fieldName?: string;
    countryCode?: string;
    countriesWithAutocomplete?: string[];
    countries?: Country[];
    formFields: FormField[];
    googleMapsApiKey?: string;
    shouldShowSaveAddress?: boolean;
    isFloatingLabelEnabled?: boolean;
    onAutocompleteSelect?(address: Partial<Address>): void;
    onAutocompleteToggle?(state: { inputValue: string; isOpen: boolean }): void;
    onChange?(fieldName: string, value: string | string[]): void;
    setFieldValue?(fieldName: string, value: string | string[]): void;
}

const LABEL: AddressKeyMap = {
    address1: 'address.address_line_1_label',
    address2: 'address.address_line_2_label',
    city: 'address.city_label',
    company: 'address.company_name_label',
    countryCode: 'address.country_label',
    firstName: 'address.first_name_label',
    lastName: 'address.last_name_label',
    phone: 'address.phone_number_label',
    postalCode: 'address.postal_code_label',
    stateOrProvince: 'address.state_label',
    stateOrProvinceCode: 'address.state_label',
};

const AUTOCOMPLETE: AddressKeyMap = {
    address1: 'address-line1',
    address2: 'address-line2',
    city: 'address-level2',
    company: 'organization',
    countryCode: 'country',
    firstName: 'given-name',
    lastName: 'family-name',
    phone: 'tel',
    postalCode: 'postal-code',
    stateOrProvince: 'address-level1',
    stateOrProvinceCode: 'address-level1',
};

const PLACEHOLDER: AddressKeyMap = {
    countryCode: 'address.select_country_action',
    stateOrProvince: 'address.select_state_action',
    stateOrProvinceCode: 'address.select_state_action',
};

const AUTOCOMPLETE_FIELD_NAME = 'address1';

const AddressForm: React.FC<AddressFormProps> = (props) => {
    const {
        formFields,
        fieldName,
        countriesWithAutocomplete,
        countryCode,
        googleMapsApiKey,
        onAutocompleteToggle,
        shouldShowSaveAddress,
        isFloatingLabelEnabled,
        countries,
        setFieldValue = noop,
        onChange = noop,
    } = props;

    const { language } = useLocale();
    const context = useContext(ThemeContext);
    const containerRef = useRef<HTMLDivElement>(null);
    const nextElementRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const { current } = containerRef;

        if (current) {
            nextElementRef.current = current.querySelector<HTMLElement>('[autocomplete="address-line2"]');
        }
    }, []);

    const syncNonFormikValue = useCallback((fieldName: string, value: string | string[]) => {
        const dateFormFieldNames = formFields
            .filter((field) => field.custom && field.fieldType === DynamicFormFieldType.DATE)
            .map((field) => field.name);

        if (fieldName === AUTOCOMPLETE_FIELD_NAME || dateFormFieldNames.includes(fieldName)) {
            setFieldValue(fieldName, value);
        }

        onChange(fieldName, value);
    }, [formFields, setFieldValue, onChange]);

    const handleDynamicFormFieldChange = useCallback((name: string) => (value: string | string[]) => {
        syncNonFormikValue(name, value);
    }, [syncNonFormikValue]);

    const handleAutocompleteChange = useCallback((value: string, isOpen: boolean) => {
        if (!isOpen) {
            syncNonFormikValue(AUTOCOMPLETE_FIELD_NAME, value);
        }
    }, [syncNonFormikValue]);

    const handleAutocompleteSelect = useCallback((
        place: google.maps.places.PlaceResult,
        item: AutocompleteItem,
    ) => {
        const { value: autocompleteValue } = item;

        const address = mapToAddress(place, countries);

        forIn(address, (value, fieldName) => {
            if (fieldName === AUTOCOMPLETE_FIELD_NAME && value === undefined) {
                return;
            }

            setFieldValue(fieldName, value as string);
            onChange(fieldName, value as string);
        });

        const address1 = address.address1 ? address.address1 : autocompleteValue;

        if (address1) {
            syncNonFormikValue(AUTOCOMPLETE_FIELD_NAME, address1);
        }
    }, [countries, setFieldValue, onChange, syncNonFormikValue]);

    const getPlaceholderValue = useCallback((field: FormField, translatedPlaceholderId: string): string => {
        if (field.default && field.fieldType !== 'dropdown') {
            return field.default;
        }

        return translatedPlaceholderId && language.translate(translatedPlaceholderId);
    }, [language]);

    if (!context) {
        throw Error('Need to wrap in style context');
    }

    const { themeV2 } = context;

    return (
        <>
            <Fieldset>
                <div
                    className="checkout-address"
                    ref={containerRef}
                >
                    {formFields.map((field) => {
                        const addressFieldName = field.name;
                        const translatedPlaceholderId = PLACEHOLDER[addressFieldName];

                        if (
                            addressFieldName === 'address1' &&
                            googleMapsApiKey &&
                            countriesWithAutocomplete
                        ) {
                            return (
                                <GoogleAutocompleteFormField
                                    apiKey={googleMapsApiKey}
                                    countryCode={countryCode}
                                    field={field}
                                    isFloatingLabelEnabled={isFloatingLabelEnabled}
                                    key={field.id}
                                    nextElement={nextElementRef.current || undefined}
                                    onChange={handleAutocompleteChange}
                                    onSelect={handleAutocompleteSelect}
                                    onToggleOpen={onAutocompleteToggle}
                                    parentFieldName={fieldName}
                                    supportedCountries={countriesWithAutocomplete}
                                />
                            );
                        }

                        return (
                            <DynamicFormField
                                autocomplete={AUTOCOMPLETE[field.name]}
                                extraClass={`dynamic-form-field--${getAddressFormFieldLegacyName(
                                    addressFieldName,
                                )}`}
                                field={field}
                                inputId={getAddressFormFieldInputId(addressFieldName)}
                                // stateOrProvince can sometimes be a dropdown or input, so relying on id is not sufficient
                                isFloatingLabelEnabled={isFloatingLabelEnabled}
                                key={`${field.id}-${field.name}`}
                                label={
                                    field.custom ? (
                                        field.label
                                    ) : (
                                        <TranslatedString id={LABEL[field.name]} />
                                    )
                                }
                                onChange={handleDynamicFormFieldChange(addressFieldName)}
                                parentFieldName={
                                    field.custom
                                        ? fieldName
                                            ? `${fieldName}.customFields`
                                            : 'customFields'
                                        : fieldName
                                }
                                placeholder={getPlaceholderValue(
                                    field,
                                    translatedPlaceholderId,
                                )}
                                themeV2={themeV2}
                            />
                        );
                    })}
                </div>
            </Fieldset>
            {shouldShowSaveAddress && (
                <CheckboxFormField
                    labelContent={<TranslatedString id="address.save_in_addressbook" />}
                    name={fieldName ? `${fieldName}.shouldSaveAddress` : 'shouldSaveAddress'}
                    themeV2={themeV2}
                />
            )}
        </>
    );
};

export default AddressForm;
