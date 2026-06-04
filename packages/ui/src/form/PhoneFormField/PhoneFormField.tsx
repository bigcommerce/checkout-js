import { type IntlTelInputRef } from '@intl-tel-input/react';
import { type FieldProps } from 'formik';
import React, { type FunctionComponent, memo, type ReactNode, useCallback, useRef } from 'react';

import { useLocale } from '@bigcommerce/checkout/contexts';

import { FormField } from '../FormField';

import { PhoneInput } from './PhoneInput';

export interface PhoneFormFieldProps {
    id: string;
    label: ReactNode;
    name: string;
    autocomplete?: string;
    maxLength?: number;
    isFloatingLabelEnabled?: boolean;
    selectedCountry?: string;
    onChange?(value: string): void;
}

export const PhoneFormField: FunctionComponent<PhoneFormFieldProps> = memo(
    ({
        id,
        label,
        name,
        autocomplete,
        maxLength,
        isFloatingLabelEnabled,
        selectedCountry,
        onChange,
    }) => {
        const { language } = useLocale();
        const intlTelInputRef = useRef<IntlTelInputRef>(null);

        const validatePhone = useCallback(
            (value: string) => {
                try {
                    const isPhoneNumberValid = intlTelInputRef.current
                        ?.getInstance()
                        ?.isValidNumber();

                    if (value && !isPhoneNumberValid) {
                        return language.translate('address.phone_number_invalid_error');
                    }
                } catch {
                    // edge case for when intl-tel-input/utils haven't finished loading yet; skip validation
                    return undefined;
                }

                return undefined;
            },
            [language],
        );

        const renderInput = useCallback(
            (props: FieldProps<string>) => (
                <PhoneInput
                    {...props}
                    autocomplete={autocomplete}
                    id={id}
                    intlTelInputRef={intlTelInputRef}
                    isFloatingLabelEnabled={isFloatingLabelEnabled}
                    maxLength={maxLength}
                    selectedCountry={selectedCountry}
                />
            ),
            [autocomplete, id, isFloatingLabelEnabled, maxLength, selectedCountry],
        );

        return (
            <FormField
                id={id}
                input={renderInput}
                isFloatingLabelEnabled={isFloatingLabelEnabled}
                label={label}
                name={name}
                onChange={onChange}
                validate={validatePhone}
            />
        );
    },
);
