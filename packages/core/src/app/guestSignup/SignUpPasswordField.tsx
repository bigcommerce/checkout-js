import { FieldProps } from 'formik';
import React, { FunctionComponent, memo, useCallback, useMemo } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import { FormField, TextInput } from '../ui/form';

export interface PasswordField {
    minLength: number;
}

const SignUpPasswordField: FunctionComponent<PasswordField> = ({ minLength }) => {
    const renderPasswordInput = useCallback(
        ({ field }: FieldProps<string>) => <TextInput {...field} id={field.name} type="password" />,
        [],
    );

    const renderPasswordConfirmationInput = useCallback(
        ({ field }: FieldProps<string>) => <TextInput {...field} id={field.name} type="password" />,
        [],
    );

    const passwordLabelContent = useMemo(
        () => (
            <>
                <TranslatedString id="customer.password_label" />{' '}
                <small>
                    {`${minLength}-`}
                    <TranslatedString id="customer.password_minimum_character_label" />
                </small>
            </>
        ),
        [minLength],
    );

    const passwordConfirmationLabelContent = useMemo(
        () => <TranslatedString id="customer.password_confirmation_label" />,
        [],
    );

    return (
        <>
            <FormField
                input={renderPasswordInput}
                labelContent={passwordLabelContent}
                name="password"
            />

            <FormField
                input={renderPasswordConfirmationInput}
                labelContent={passwordConfirmationLabelContent}
                name="confirmPassword"
            />
        </>
    );
};

export default memo(SignUpPasswordField);
