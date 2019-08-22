import { FieldProps } from 'formik';
import React, { useCallback, useMemo, FunctionComponent } from 'react';

import { TranslatedString } from '../locale';
import { FormField, TextInput } from '../ui/form';
import { IconEye, IconEyeSlash } from '../ui/icon';
import { Toggle } from '../ui/toggle';

export interface PasswordFieldProps {
    forgotPasswordUrl: string;
}

const PasswordField: FunctionComponent<PasswordFieldProps> = ({
    forgotPasswordUrl,
}) => {
    const renderInput = useCallback((props: FieldProps) => (
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
    ), []);

    const labelContent = useMemo(() => (
        <TranslatedString id={ 'customer.password_label' } />
    ), []);

    const footer = useMemo(() => (
        <a
            data-test="forgot-password-link"
            href={ forgotPasswordUrl }
            rel="noopener noreferrer"
            target="_blank"
        >
            <TranslatedString id="customer.forgot_password_action" />
        </a>
    ), [forgotPasswordUrl]);

    return <FormField
        labelContent={ labelContent }
        name="password"
        footer={ footer }
        input={ renderInput }
    />;
};

export default PasswordField;
