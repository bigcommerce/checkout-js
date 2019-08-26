import { FieldProps } from 'formik';
import React, { useCallback, useMemo, Fragment, FunctionComponent } from 'react';

import { TranslatedString } from '../locale';
import { FormField, TextInput } from '../ui/form';

export interface PasswordField {
    minLength: number;
}

const SignUpPasswordField: FunctionComponent<PasswordField> = ({
    minLength,
}) => {
    const renderPasswordInput = useCallback(({ field }: FieldProps<string>) => (
        <TextInput
            { ...field }
            id={ field.name }
            type="password"
        />
    ), []);

    const renderPasswordConfirmationInput = useCallback(({ field }: FieldProps<string>) => (
        <TextInput
            { ...field }
            id={ field.name }
            type="password"
        />
    ), []);

    const labelContent = useMemo(() => (
        <Fragment>
            <TranslatedString id={ 'customer.password_label' } />&nbsp;
            <small>
                { minLength }-<TranslatedString id={ 'customer.password_minimum_character_label' } />
            </small>
        </Fragment>
    ), [minLength]);

    return <Fragment>
        <FormField
            name="password"
            labelContent={ labelContent }
            input={ renderPasswordInput }
        />

        <FormField
            name="confirmPassword"
            labelContent={ <TranslatedString id={'customer.password_confirmation_label' } /> }
            input={ renderPasswordConfirmationInput }
        />
    </Fragment>;
};

export default SignUpPasswordField;
