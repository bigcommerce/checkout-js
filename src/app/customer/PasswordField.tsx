import { FieldProps } from 'formik';
import React, { memo, useCallback, useMemo, FunctionComponent } from 'react';

import { TranslatedString } from '../locale';
import { FormField, TextInput } from '../ui/form';
import { IconEye, IconEyeSlash } from '../ui/icon';
import { Toggle } from '../ui/toggle';

export interface PasswordFieldProps {
    forgotPasswordUrl?: string;
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
                        additionalClassName="form-input--withIcon"
                        id={ props.field.name }
                        type={ isOpen ? 'text' : 'password' }
                    />
                    <a className="form-toggle-password form-input-icon" href="#" onClick={ toggle }>
                        { isOpen ? <IconEye /> : <IconEyeSlash /> }
                    </a>
                </div>
            ) }
        </Toggle>
    ), []);

    const labelContent = useMemo(() => (
        <TranslatedString id={ 'customer.password_label' } />
    ), []);

    const footer = useMemo(() => {
        if (!forgotPasswordUrl) {
            return null;
        }

        return <a
            data-test="forgot-password-link"
            href={ forgotPasswordUrl }
            rel="noopener noreferrer"
            target="_blank"
        >
            <TranslatedString id="customer.forgot_password_action" />
        </a>;
    }, [forgotPasswordUrl]);

    return <FormField
        footer={ footer }
        input={ renderInput }
        labelContent={ labelContent }
        name="password"
    />;
};

export default memo(PasswordField);
