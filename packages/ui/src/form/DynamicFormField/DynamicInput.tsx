import { FormFieldItem } from '@bigcommerce/checkout-sdk';
import { isDate, noop } from 'lodash';
import React, { FunctionComponent, memo, useCallback } from 'react';
import ReactDatePicker from 'react-datepicker';

import { useLocale } from '@bigcommerce/checkout/locale';

import { CheckboxInput } from '../CheckboxInput';
import { InputProps } from '../Input';
import { RadioInput } from '../RadioInput';
import { TextArea } from '../TextArea';
import { TextInput } from '../TextInput';

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
    fieldType,
    id,
    name,
    onChange = noop,
    options,
    placeholder,
    value,
    ...rest
}) => {
    const { date } = useLocale();
    const { inputFormat } = date || { inputFormat: '' };
    const handleDateChange = useCallback(
        (dateValue: string, event) =>
            onChange({
                ...event,
                target: {
                    name,
                    value: dateValue,
                },
            }),
        [onChange, name],
    );

    switch (fieldType) {
        case DynamicFormFieldType.DROPDOWM:
            return (
                <select
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions
                    {...(rest as any)}
                    className="form-select optimizedCheckout-form-select"
                    data-test={`${id}-select`}
                    id={id}
                    name={name}
                    onChange={onChange}
                    value={!value ? '' : value}
                >
                    {Boolean(placeholder) && <option value="">{placeholder}</option>}
                    {options &&
                        options.map(({ label, value: optionValue }) => (
                            <option key={optionValue} value={optionValue}>
                                {label}
                            </option>
                        ))}
                </select>
            );

        case DynamicFormFieldType.RADIO:
            if (!options || !options.length) {
                return null;
            }

            return (
                <>
                    {options.map(({ label, value: optionValue }) => (
                        <RadioInput
                            {...rest}
                            checked={optionValue === value}
                            id={`${id}-${optionValue}`}
                            key={optionValue}
                            label={label}
                            name={name}
                            onChange={onChange}
                            testId={`${id}-${optionValue}-radio`}
                            value={optionValue}
                        />
                    ))}
                </>
            );

        case DynamicFormFieldType.CHECKBOX:
            if (!options || !options.length) {
                return null;
            }

            return (
                <>
                    {options.map(({ label, value: optionValue }) => (
                        <CheckboxInput
                            {...rest}
                            checked={Array.isArray(value) ? value.includes(optionValue) : false}
                            id={`${id}-${optionValue}`}
                            key={optionValue}
                            label={label}
                            name={name}
                            onChange={onChange}
                            testId={`${id}-${optionValue}-checkbox`}
                            value={optionValue}
                        />
                    ))}
                </>
            );

        case DynamicFormFieldType.DATE:
            return (
                <ReactDatePicker
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions
                    {...(rest as any)}
                    autoComplete="off"
                    // FIXME: we can avoid this by simply using onChangeRaw, but it's not being triggered properly
                    // https://github.com/Hacker0x01/react-datepicker/issues/1357
                    // onChangeRaw={ rest.onChange }
                    calendarClassName="optimizedCheckout-contentPrimary"
                    className="form-input optimizedCheckout-form-input"
                    dateFormat={inputFormat}
                    maxDate={rest.max ? new Date(`${rest.max}T00:00:00Z`) : undefined}
                    minDate={rest.min ? new Date(`${rest.min}T00:00:00Z`) : undefined}
                    name={name}
                    onChange={handleDateChange}
                    placeholderText={inputFormat.toUpperCase()}
                    popperClassName="optimizedCheckout-contentPrimary"
                    selected={isDate(value) ? value : undefined}
                />
            );

        case DynamicFormFieldType.MULTILINE:
            return (
                <TextArea
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions
                    {...(rest as any)}
                    id={id}
                    name={name}
                    onChange={onChange}
                    testId={`${id}-text`}
                    type={fieldType}
                    value={value}
                />
            );

        default:
            return (
                <TextInput
                    {...rest}
                    id={id}
                    name={name}
                    onChange={onChange}
                    placeholder={placeholder}
                    testId={`${id}-${
                        fieldType === DynamicFormFieldType.PASSWORD ? 'password' : 'text'
                    }`}
                    type={fieldType}
                    value={value}
                />
            );
    }
};

export default memo(DynamicInput);
