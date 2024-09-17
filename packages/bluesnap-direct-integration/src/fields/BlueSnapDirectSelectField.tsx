import { FormFieldOptions } from '@bigcommerce/checkout-sdk';
import { FieldProps } from 'formik';
import React, { FunctionComponent, memo, useCallback } from 'react';

import { DynamicFormFieldType, DynamicInput, FormField } from '@bigcommerce/checkout/ui';

export interface BlueSnapDirectSelectFieldProps {
    labelContent: string;
    name: string;
    options: FormFieldOptions;
    useFloatingLabel?: boolean;
}

const BlueSnapDirectSelectField: FunctionComponent<BlueSnapDirectSelectFieldProps> = ({
    options: { helperLabel, items, rows },
    useFloatingLabel,
    ...rest
}) => {
    const renderSelect = useCallback(
        ({ field }: FieldProps<string>) => (
            <DynamicInput
                {...field}
                aria-labelledby={`${field.name}-label ${field.name}-field-error-message`}
                fieldType={DynamicFormFieldType.DROPDOWM}
                id={field.name}
                isFloatingLabelEnabled={useFloatingLabel}
                options={items}
                placeholder={helperLabel}
                rows={rows}
            />
        ),
        [helperLabel, items, rows, useFloatingLabel],
    );

    return <FormField {...rest} input={renderSelect} />;
};

export default memo(BlueSnapDirectSelectField);
