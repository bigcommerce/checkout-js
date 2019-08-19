import React, { Fragment, FunctionComponent } from 'react';

import { TranslatedString } from '../locale';
import { FormField, TextInput } from '../ui/form';

export interface PasswordField {
    minLength: number;
}

const SignUpPasswordField: FunctionComponent<PasswordField> = ({
    minLength,
}) => (<Fragment>
     <FormField
        name="password"
        labelContent={ <Fragment>
            <TranslatedString id={'customer.password_label' } />&nbsp;
            <small>
                { minLength }-<TranslatedString id={'customer.password_minimum_character_label'} />
            </small>
        </Fragment>}
        input={ props =>
            <TextInput
                { ...props.field }
                id={ props.field.name }
                type="password"
            />}
    />
    <FormField
        name="confirmPassword"
        labelContent={ <TranslatedString id={'customer.password_confirmation_label' } /> }
        input={ ({ field }) =>
            <TextInput
                { ...field }
                id={ field.name }
                type="password"
            />
        }
    />
</Fragment>);

export default SignUpPasswordField;
