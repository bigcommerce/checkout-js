import IntlTelInput, { type IntlTelInputRef } from '@intl-tel-input/react';
import 'intl-tel-input/styles';
import classNames from 'classnames';
import { type FieldProps } from 'formik';
import React, {
    type FunctionComponent,
    type RefObject,
    useCallback,
    useEffect,
    useRef,
} from 'react';

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
    const isPhoneCountryAutoSetRef = useRef(false);

    const currentValue = value ? String(value) : '';

    useEffect(() => {
        if (!selectedCountry || value || isPhoneCountryAutoSetRef.current) {
            return;
        }

        const selectedCountryInIsoFormat = selectedCountry.toLowerCase();

        if (!isIso2(selectedCountryInIsoFormat)) {
            return;
        }

        try {
            const intlTelInputInstance = intlTelInputRef.current?.getInstance();

            if (intlTelInputInstance) {
                intlTelInputInstance.setCountry(selectedCountryInIsoFormat);
                isPhoneCountryAutoSetRef.current = true;
            }
        } catch {
            // Defensive: the underlying library throws for unrecognized iso2 codes.
            // Ref stays unset so a later, different selectedCountry can still be applied.
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCountry]);

    const handleChangeNumber = useCallback(
        (newPhoneNumber: string) => {
            // Ignore no-op emissions fired by the library itself
            if (newPhoneNumber === currentValue) {
                return;
            }

            void setFieldValue(name, newPhoneNumber);
        },
        [name, setFieldValue, currentValue],
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
                value={currentValue}
            />
        </span>
    );
};
