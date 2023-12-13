import { FieldProps } from 'formik';
import React, { FunctionComponent, memo, useCallback } from 'react';

import { DynamicInput, FormField } from '@bigcommerce/checkout/ui';

export interface BlueSnapDirectTextFieldProps {
    labelContent: string;
    maxLength?: number;
    name: string;
    autoComplete?: string;
    useFloatingLabel?: boolean;
}

const BlueSnapDirectTextField: FunctionComponent<BlueSnapDirectTextFieldProps> = ({
    maxLength,
    useFloatingLabel,
    autoComplete,
    ...rest
}) => {
    const renderInput = useCallback(
        ({ field }: FieldProps<string>) => (
            <DynamicInput
                {...field}
                aria-labelledby={`${field.name}-label ${field.name}-field-error-message`}
                autoComplete={autoComplete}
                id={field.name}
                isFloatingLabelEnabled={useFloatingLabel}
                maxLength={maxLength}
            />
        ),
        [maxLength, useFloatingLabel, autoComplete],
    );

    return <FormField input={renderInput} {...rest} />;
};

export default memo(BlueSnapDirectTextField);
