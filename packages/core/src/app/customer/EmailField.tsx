import { type FieldProps } from 'formik';
import React, { type FunctionComponent, memo, useCallback, useMemo } from 'react';

import { useThemeContext } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from '@bigcommerce/checkout/locale';

import { FormField, TextInput } from '../ui/form';

export interface EmailFieldProps {
    isFloatingLabelEnabled?: boolean;
    onChange?(value: string): void;
}

const EmailField: FunctionComponent<EmailFieldProps> = ({ onChange, isFloatingLabelEnabled }) => {
    const { themeV2 } = useThemeContext();

    const renderInput = useCallback(
        (props: FieldProps) => (
            <TextInput
                {...props.field}
                autoComplete={props.field.name}
                id={props.field.name}
                isFloatingLabelEnabled={isFloatingLabelEnabled}
                themeV2={themeV2}
                type="email"
            />
        ),
        [isFloatingLabelEnabled],
    );

    const labelContent = useMemo(() => <TranslatedString id="customer.email_label" />, []);

    return (
        <FormField
            input={renderInput}
            isFloatingLabelEnabled={isFloatingLabelEnabled}
            labelContent={labelContent}
            name="email"
            onChange={onChange}
            themeV2={themeV2}
        />
    );
};

export default memo(EmailField);
