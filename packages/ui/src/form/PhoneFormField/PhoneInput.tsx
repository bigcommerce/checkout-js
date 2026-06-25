import IntlTelInput, { type IntlTelInputRef } from '@intl-tel-input/react';
import 'intl-tel-input/styles';
import classNames from 'classnames';
import { type FieldProps } from 'formik';
import React, { type FunctionComponent, type RefObject, useCallback, useEffect } from 'react';

import { isIso2 } from '../../utils';

interface PhoneInputProps extends FieldProps<string> {
    id: string;
    autocomplete?: string;
    maxLength?: number;
    isFloatingLabelEnabled?: boolean;
    selectedCountry?: string;
    intlTelInputRef: RefObject<IntlTelInputRef>;
}

export const PhoneInput: FunctionComponent<PhoneInputProps> = ({
    field: { name, value, onBlur },
    form: { setFieldValue },
    id,
    autocomplete,
    maxLength,
    isFloatingLabelEnabled,
    selectedCountry,
    intlTelInputRef,
}) => {
    useEffect(() => {
        if (!selectedCountry || value) {
            return;
        }

        const selectedCountryInIsoFormat = selectedCountry.toLowerCase();

        if (isIso2(selectedCountryInIsoFormat)) {
            intlTelInputRef.current?.getInstance()?.setCountry(selectedCountryInIsoFormat);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCountry]);

    const handleChangeNumber = useCallback(
        (newPhoneNumber: string) => {
            void setFieldValue(name, newPhoneNumber);
        },
        [name, setFieldValue],
    );

    return (
        <span className="iti-wrapper">
            <IntlTelInput
                autoPlaceholder="off"
                inputProps={{
                    'aria-labelledby': `${id}-label ${id}-field-error-message`,
                    // using spread to avoid type error, data-test is valid but types are incorrect on the library side
                    ...{ 'data-test': `${id}-text` },
                    autoComplete: autocomplete,
                    id,
                    maxLength,
                    name,
                    onBlur,
                    className: classNames('form-input optimizedCheckout-form-input', {
                        'floating-input floating-form-field-input': isFloatingLabelEnabled,
                    }),
                }}
                loadUtils={() =>
                    import(
                        /* webpackChunkName: "intl-tel-input-utils" */
                        'intl-tel-input/utils'
                    )
                }
                onChangeNumber={handleChangeNumber}
                ref={intlTelInputRef}
                separateDialCode={false}
                strictRejectAnimation={false}
                value={value ? String(value) : ''}
            />
        </span>
    );
};
