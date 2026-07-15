import classNames from 'classnames';
import { type FieldProps } from 'formik';
import React, { type FunctionComponent, useCallback } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { FormField, TextInput } from '@bigcommerce/checkout/ui';

interface AdditionalPaymentFieldProps {
    label: string;
    isRequired: boolean;
    isFloatingLabelEnabled?: boolean;
}

const AdditionalPaymentField: FunctionComponent<AdditionalPaymentFieldProps> = ({
    label,
    isRequired,
    isFloatingLabelEnabled,
}) => {
    const renderInput = useCallback(
        ({ field }: FieldProps<string>) => (
            <TextInput
                {...field}
                id="additionalPaymentField"
                isFloatingLabelEnabled={isFloatingLabelEnabled}
                testId="additionalPaymentField-input"
            />
        ),
        [],
    );

    return (
        <div
            className={classNames('dynamic-form-field', {
                'floating-form-field': isFloatingLabelEnabled,
            })}
        >
            <FormField
                id="additionalPaymentField"
                input={renderInput}
                isFloatingLabelEnabled={isFloatingLabelEnabled}
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
