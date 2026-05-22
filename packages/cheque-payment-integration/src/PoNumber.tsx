import { type FieldProps } from 'formik';
import React, { type FunctionComponent, useCallback } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { FormField, Legend, TextInput } from '@bigcommerce/checkout/ui';
import { setPoNumber } from '@bigcommerce/checkout/utility';

import './PoNumber.scss';

export interface PoNumberProps {
    label: string;
    isRequired: boolean;
}

export const PO_NUMBER_FIELD_NAME = 'poNumber';

const PoNumber: FunctionComponent<PoNumberProps> = ({ label, isRequired }) => {
    const renderInput = useCallback(
        ({ field }: FieldProps<string>) => (
            <TextInput
                {...field}
                aria-labelledby={`${PO_NUMBER_FIELD_NAME}-label ${PO_NUMBER_FIELD_NAME}-field-error-message`}
                id={PO_NUMBER_FIELD_NAME}
            />
        ),
        [],
    );

    const handleChange = useCallback((value: string) => {
        setPoNumber(value.trim());
    }, []);

    return (
        <div className="po-number-container">
            <FormField
                input={renderInput}
                label={
                    <Legend>
                        <label
                            className="po-number-label"
                            htmlFor={PO_NUMBER_FIELD_NAME}
                            id={`${PO_NUMBER_FIELD_NAME}-label`}
                        >
                            <span>{label}</span>
                            {!isRequired && (
                                <span>
                                    {' '}
                                    <TranslatedString id="payment.po_number_optional" />
                                </span>
                            )}
                        </label>
                    </Legend>
                }
                name={PO_NUMBER_FIELD_NAME}
                onChange={handleChange}
            />
        </div>
    );
};

export default PoNumber;
