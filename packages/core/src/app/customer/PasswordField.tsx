import { FieldProps } from 'formik';
import React, { FunctionComponent, memo, useCallback, useMemo } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { useThemeContext } from '@bigcommerce/checkout/ui';

import { FormField, TextInput } from '../ui/form';
import Label from '../ui/form/Label';
import { IconEye, IconEyeSlash } from '../ui/icon';
import { Toggle } from '../ui/toggle';

interface WithFloatingLabel {
    isFloatingLabelEnabled?: boolean;
}

const PasswordField: FunctionComponent<WithFloatingLabel> = ({ isFloatingLabelEnabled = false }) => {
    const { newFontStyle } = useThemeContext();

    const renderInput = useCallback(
        (props: FieldProps) => (
            <Toggle openByDefault={false}>
                {({ isOpen, toggle }) => (
                    <div className="form-field-password">
                        <TextInput
                            {...props.field}
                            additionalClassName="form-input--withIcon"
                            id={props.field.name}
                            isFloatingLabelEnabled={isFloatingLabelEnabled}
                            newFontStyle={newFontStyle}
                            type={isOpen ? 'text' : 'password'}
                        />
                        {isFloatingLabelEnabled && (
                            <Label
                                additionalClassName={newFontStyle ? 'floating-form-field-label' : ''}
                                htmlFor={props.field.name}
                                id={`${props.field.name}-label`}
                                isFloatingLabelEnabled={true}
                            >
                                <TranslatedString id="customer.password_label" />
                            </Label>
                        )}
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
        [isFloatingLabelEnabled],
    );

    const labelContent = useMemo(() => <TranslatedString id="customer.password_label" />, []);

    return <FormField input={renderInput} isFloatingLabelEnabled={isFloatingLabelEnabled} labelContent={isFloatingLabelEnabled ? null : labelContent} name="password" />;
};

export default memo(PasswordField);
