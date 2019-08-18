import React, { FunctionComponent } from 'react';

import { TranslatedString } from '../language';
import { FormField, TextInput } from '../ui/form';
import { IconEye, IconEyeSlash } from '../ui/icon';
import { Toggle } from '../ui/toggle';

export interface PasswordFieldProps {
    forgotPasswordUrl: string;
}

const PasswordField: FunctionComponent<PasswordFieldProps> = ({
    forgotPasswordUrl,
}) => (
    <FormField
        labelContent={ <TranslatedString id={'customer.password_label' } /> }
        name="password"
        footer={
            <a
                data-test="forgot-password-link"
                href={ forgotPasswordUrl }
                target="_blank"
            >
                <TranslatedString id="customer.forgot_password_action" />
            </a>
        }
        input={ props =>
            <Toggle openByDefault={ false }>
                { ({ isOpen, toggle }) => (
                    <div className="form-field-password">
                        <TextInput
                            { ...props.field }
                            id={ props.field.name }
                            additionalClassName="form-input--withIcon"
                            type={ isOpen ? 'text' : 'password' }
                        />
                        <a href="#" className="form-toggle-password form-input-icon" onClick={ toggle } >
                            { isOpen ? <IconEye /> : <IconEyeSlash /> }
                        </a>
                    </div>
                ) }
            </Toggle>
        }
    />
);

export default PasswordField;
