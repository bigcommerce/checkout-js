import { FormFieldItem } from '@bigcommerce/checkout-sdk';
import { isDate, noop } from 'lodash';
import React, { memo, useCallback, FunctionComponent } from 'react';
import ReactDatePicker from 'react-datepicker';

import { CheckboxInput, InputProps, RadioInput, TextArea, TextInput } from '../ui/form';

import DynamicFormFieldType from './DynamicFormFieldType';

export interface DynamicInputProps extends InputProps {
    id: string;
    additionalClassName?: string;
    value?: string | string[];
    rows?: number;
    fieldType?: DynamicFormFieldType;
    options?: FormFieldItem[];
}

const DynamicInput: FunctionComponent<DynamicInputProps> = ({
    additionalClassName,
    fieldType,
    id,
    name,
    onChange = noop,
    options,
    placeholder,
    value,
    ...rest
}) => {
    const handleDateChange = useCallback((date, event) => onChange({
        ...event,
        target: {
            name,
            value: date,
        },
    }), [
        onChange,
        name,
    ]);

    switch (fieldType) {
    case DynamicFormFieldType.dropdown:
        return (
            <select
                { ...rest as any }
                name={ name }
                onChange={ onChange }
                id={ id }
                data-test={ `${id}-select` }
                className="form-select optimizedCheckout-form-select"
                value={ value === null ? '' : value }
            >
                { placeholder &&
                    <option value="">
                        { placeholder }
                    </option> }
                { options && options.map(({ label, value: optionValue }) =>
                    <option
                        key={ optionValue }
                        value={ optionValue }
                    >
                        { label }
                    </option>
                ) }
            </select>
        );

    case DynamicFormFieldType.radio:
        if (!options || !options.length) {
            return null;
        }

        return <>{ options.map(({ label, value: optionValue }) =>
            <RadioInput
                { ...rest }
                name={ name }
                onChange={ onChange }
                id={ `${id}-${optionValue}` }
                testId={ `${id}-${optionValue}-radio` }
                key={ optionValue }
                label={ label }
                value={ optionValue }
                checked={ optionValue === value }
            />) }</>;

    case DynamicFormFieldType.checkbox:
        if (!options || !options.length) {
            return null;
        }

        return <>{ options.map(({ label, value: optionValue }) =>
            <CheckboxInput
                { ...rest }
                name={ name }
                onChange={ onChange }
                id={ `${id}-${optionValue}` }
                testId={ `${id}-${optionValue}-checkbox` }
                key={ optionValue }
                label={ label }
                value={ optionValue }
                checked={ Array.isArray(value) ? value.includes(optionValue) : false }
            />) }</>;

    case DynamicFormFieldType.date:
        return (
            <ReactDatePicker
                { ...rest as any }
                name={ name }
                // FIXME: we can avoid this by simply using onChangeRaw, but it's not being triggered properly
                // https://github.com/Hacker0x01/react-datepicker/issues/1357
                // onChangeRaw={ rest.onChange }
                onChange={ handleDateChange }
                autoComplete="off"
                placeholderText="MM/DD/YYYY"
                minDate={ rest.min ? new Date(rest.min) : undefined }
                maxDate={ rest.max ? new Date(rest.max) : undefined }
                className="form-input optimizedCheckout-form-input"
                popperClassName="optimizedCheckout-contentPrimary"
                calendarClassName="optimizedCheckout-contentPrimary"
                selected={ isDate(value) ? value : undefined }
            />
        );

    case DynamicFormFieldType.multiline:
        return (
            <TextArea
                { ...rest as any }
                name={ name }
                onChange={ onChange }
                id={ id }
                testId={ `${id}-text` }
                type={ fieldType }
                value={ value }
            />
        );

    default:
        return (
            <TextInput
                { ...rest }
                name={ name }
                onChange={ onChange }
                id={ id }
                testId={ `${id}-${ fieldType === DynamicFormFieldType.password ?
                    'password' :
                    'text' }` }
                type={ fieldType }
                value={ value }
            />
        );
    }
};

export default memo(DynamicInput);
