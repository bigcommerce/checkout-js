import IntlTelInput, { type IntlTelInputRef } from '@intl-tel-input/react';
import 'intl-tel-input/styles';
import classNames from 'classnames';
import { type FieldProps } from 'formik';
import React, { type FunctionComponent, type RefObject, useEffect } from 'react';

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
    field: { name, value, onBlur, onChange },
    id,
    autocomplete,
    maxLength,
    isFloatingLabelEnabled,
    selectedCountry,
    intlTelInputRef,
}) => {
    useEffect(() => {
        // auto-set phone number country based on shipping address
        if (!selectedCountry || value) {
            return;
        }

        const selectedCountryInIsoFormat = selectedCountry.toLowerCase();

        if (isIso2(selectedCountryInIsoFormat)) {
            intlTelInputRef.current?.getInstance()?.setCountry(selectedCountryInIsoFormat);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCountry]);

    return (
        <span className="iti-wrapper">
            <IntlTelInput
                inputProps={{
                    'aria-labelledby': `${id}-label ${id}-field-error-message`,
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
                onChangeNumber={(number) => {
                    onChange({
                        target: { name, value: number },
                    } as React.ChangeEvent<HTMLInputElement>);
                }}
                ref={intlTelInputRef}
                separateDialCode={false}
                value={value ? String(value) : ''}
            />
        </span>
    );
};
