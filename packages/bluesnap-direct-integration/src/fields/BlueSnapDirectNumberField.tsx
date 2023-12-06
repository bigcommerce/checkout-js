import { FieldProps } from 'formik';
import React, { FunctionComponent, memo, useCallback } from 'react';

import { DynamicFormFieldType, DynamicInput, FormField } from '@bigcommerce/checkout/ui';

export interface BlueSnapDirectNumberFieldProps {
    labelContent: string;
    maxLength?: number;
    name: string;
    useFloatingLabel?: boolean;
}

const BlueSnapDirectNumberField: FunctionComponent<BlueSnapDirectNumberFieldProps> = ({
    maxLength,
    useFloatingLabel,
    ...rest
}) => {
    const renderInput = useCallback(
        ({ field }: FieldProps<string>) => (
            <DynamicInput
                {...field}
                aria-labelledby={`${field.name}-label ${field.name}-field-error-message`}
                autoComplete="cc-number"
                fieldType={DynamicFormFieldType.TELEPHONE}
                id={field.name}
                isFloatingLabelEnabled={useFloatingLabel}
                maxLength={maxLength}
            />
        ),
        [maxLength, useFloatingLabel],
    );

    return <FormField input={renderInput} {...rest} />;
};

export default memo(BlueSnapDirectNumberField);
