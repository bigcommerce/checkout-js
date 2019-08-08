import React, { FunctionComponent } from 'react';

import { TranslatedString } from '../language';
import { FormField, TextInput } from '../ui/form';

export interface EmailFieldProps {
    onChange?(value: string): void;
}

const EmailField: FunctionComponent<EmailFieldProps>  = ({
    onChange,
}) => (
    <FormField
        name="email"
        labelContent={ <TranslatedString id="customer.email_label" /> }
        onChange={ onChange }
        input={ props =>
            <TextInput
                { ...props.field }
                autoComplete={ props.field.name }
                id={ props.field.name }
                type="email"
            />
        }
    />
);

export default EmailField;
