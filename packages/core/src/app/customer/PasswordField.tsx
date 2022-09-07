import { FieldProps } from 'formik';
import React, { memo, useCallback, useMemo, FunctionComponent } from 'react';

import { TranslatedString } from '../locale';
import { FormField, TextInput } from '../ui/form';
import { IconEye, IconEyeSlash } from '../ui/icon';
import { Toggle } from '../ui/toggle';

const PasswordField: FunctionComponent = () => {
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

    return <FormField
        input={ renderInput }
        labelContent={ labelContent }
        name="password"
    />;
};

export default memo(PasswordField);
