import { FieldProps } from 'formik';
import { kebabCase } from 'lodash';
import React, { memo, useCallback, Fragment, FunctionComponent, ReactNode } from 'react';

import BasicFormField from './BasicFormField';
import CheckboxInput from './CheckboxInput';
import FormFieldError from './FormFieldError';

export interface CheckboxFormFieldProps {
    additionalClassName?: string;
    name: string;
    id?: string;
    labelContent: ReactNode;
    onChange?(isChecked: boolean): void;
}

const CheckboxFormField: FunctionComponent<CheckboxFormFieldProps> = ({
    additionalClassName,
    labelContent,
    onChange,
    name,
    id,
}) => {
    const renderField = useCallback(({ field }: FieldProps) => (
        <Fragment>
            { <CheckboxInput
                { ...field }
                checked={ !!field.value }
                id={ id || field.name }
                label={ labelContent }
            /> }

            <FormFieldError
                name={ name }
                testId={ `${kebabCase(name)}-field-error-message` }
            />
        </Fragment>
    ), [
        id,
        labelContent,
        name,
    ]);

    return <BasicFormField
        additionalClassName={ additionalClassName }
        name={ name }
        onChange={ onChange }
        render={ renderField }
    />;
};

export default memo(CheckboxFormField);
