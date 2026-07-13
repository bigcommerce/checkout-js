import { type FieldProps } from 'formik';
import React, { type FunctionComponent, useCallback } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { FormField, TextInput } from '@bigcommerce/checkout/ui';

interface AdditionalPaymentFieldProps {
    label: string;
    isRequired: boolean;
}

const AdditionalPaymentField: FunctionComponent<AdditionalPaymentFieldProps> = ({
    label,
    isRequired,
}) => {
    const renderInput = useCallback(
        ({ field }: FieldProps<string>) => (
            <TextInput
                {...field}
                id="additionalPaymentField"
                testId="additionalPaymentField-input"
            />
        ),
        [],
    );

    return (
        <div className="dynamic-form-field">
            <FormField
                id="additionalPaymentField"
                input={renderInput}
                labelContent={
                    <>
                        {label}
                        {!isRequired && (
                            <>
                                {' '}
                                <small>
                                    <TranslatedString id="common.optional_text" />
                                </small>
                            </>
                        )}
                    </>
                }
                name="additionalPaymentField"
            />
        </div>
    );
};

export default AdditionalPaymentField;
