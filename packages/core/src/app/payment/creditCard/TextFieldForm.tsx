import React, { FunctionComponent, memo, useCallback, useMemo } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import { Fieldset, FormField, TextInput } from '../../ui/form';

export interface TextFieldProps {
    additionalClassName: string;
    autoComplete: string;
    labelId: string;
    name: string;
}

export interface TextFieldFormProps {
    additionalClassName: string;
    autoComplete: string;
    labelId: string;
    name: string;
}

const TextField: FunctionComponent<TextFieldProps> = (props) => {
    const { additionalClassName, autoComplete, labelId, name } = props;

    const renderInput = useCallback(
        ({ field }) => <TextInput {...field} autoComplete={autoComplete} id={field.name} />,
        [autoComplete],
    );

    const labelContent = useMemo(() => <TranslatedString id={labelId} />, [labelId]);

    return (
        <FormField
            additionalClassName={additionalClassName}
            input={renderInput}
            labelContent={labelContent}
            name={name}
        />
    );
};

const TextFieldForm: FunctionComponent<TextFieldFormProps> = ({
    additionalClassName,
    autoComplete,
    labelId,
    name,
}) => (
    <Fieldset>
        <div className="form-ccFields">
            <TextField
                additionalClassName={additionalClassName}
                autoComplete={autoComplete}
                labelId={labelId}
                name={name}
            />
        </div>
    </Fieldset>
);

export default memo(TextFieldForm);
