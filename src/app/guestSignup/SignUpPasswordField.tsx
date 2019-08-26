import { FieldProps } from 'formik';
import React, { memo, useCallback, useMemo, Fragment, FunctionComponent } from 'react';

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

    const passwordLabelContent = useMemo(() => (
        <Fragment>
            <TranslatedString id={ 'customer.password_label' } />&nbsp;
            <small>
                { minLength }-<TranslatedString id={ 'customer.password_minimum_character_label' } />
            </small>
        </Fragment>
    ), [minLength]);

    const passwordConfirmationLabelContent = useMemo(() => (
        <TranslatedString id={ 'customer.password_confirmation_label' } />
    ), []);

    return <Fragment>
        <FormField
            name="password"
            labelContent={ passwordLabelContent }
            input={ renderPasswordInput }
        />

        <FormField
            name="confirmPassword"
            labelContent={ passwordConfirmationLabelContent }
            input={ renderPasswordConfirmationInput }
        />
    </Fragment>;
};

export default memo(SignUpPasswordField);
