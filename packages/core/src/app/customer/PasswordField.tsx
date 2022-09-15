import { FieldProps } from 'formik';
import React, { FunctionComponent, memo, useCallback } from 'react';

import { TranslatedString } from '../locale';
import { FormField, TextInput } from '../ui/form';
import Label from '../ui/form/Label';
import { IconEye, IconEyeSlash } from '../ui/icon';
import { Toggle } from '../ui/toggle';

interface WithFloatingLabel {
    useFloatingLabel?: boolean;
}

const PasswordField: FunctionComponent<WithFloatingLabel> = ({ useFloatingLabel = false }) => {
    const renderInput = useCallback(
        (props: FieldProps) => (
            <Toggle openByDefault={false}>
                {({ isOpen, toggle }) => (
                    <div className="form-field-password">
                        <TextInput
                            {...props.field}
                            additionalClassName="form-input--withIcon"
                            id={props.field.name}
                            type={isOpen ? 'text' : 'password'}
                            useFloatingLabel={useFloatingLabel}
                        />
                        <Label useFloatingLabel={useFloatingLabel}>
                            <TranslatedString id="customer.password_label" />
                        </Label>
                        <a
                            className="form-toggle-password form-input-icon"
                            href="#"
                            onClick={toggle}
                        >
                            {isOpen ? <IconEye /> : <IconEyeSlash />}
                        </a>
                    </div>
                )}
            </Toggle>
        ),
        [useFloatingLabel],
    );

    return <FormField input={renderInput} name="password" useFloatingLabel={useFloatingLabel} />;
};

export default memo(PasswordField);
