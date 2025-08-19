import creditCardType from 'credit-card-type';
import { type FieldProps } from 'formik';
import { max } from 'lodash';
import React, {
    type ChangeEventHandler,
    type FunctionComponent,
    memo,
    type ReactElement,
    useCallback,
    useEffect,
    useMemo,
    useRef,
} from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import { FormField, TextInput } from '../../ui/form';
import { IconLock } from '../../ui/icon';

import formatCreditCardNumber from './formatCreditCardNumber';

export interface CreditCardNumberFieldProps {
    name: string;
}

const CreditCardNumberField: FunctionComponent<CreditCardNumberFieldProps> = ({ name }) => {
    const renderInput = useCallback(
        ({ field, form }: FieldProps<string>) => (
            <CreditCardNumberInput field={field} form={form} />
        ),
        [],
    );

    const labelContent = useMemo(
        () => <TranslatedString id="payment.credit_card_number_label" />,
        [],
    );

    return (
        <FormField
            additionalClassName="form-field--ccNumber"
            input={renderInput}
            labelContent={labelContent}
            name={name}
        />
    );
};

interface CreditCardNumberInputProps {
    field: FieldProps<string>['field'];
    form: FieldProps<string>['form'];
}

const CreditCardNumberInput: FunctionComponent<CreditCardNumberInputProps> = ({ field, form }): ReactElement => {
    const inputRef = useRef<HTMLInputElement>(null);
    const nextSelectionEndRef = useRef(0);

    useEffect(() => {
        if (inputRef.current && inputRef.current.selectionEnd !== nextSelectionEndRef.current) {
            inputRef.current.setSelectionRange(nextSelectionEndRef.current, nextSelectionEndRef.current);
        }
    });

    const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback(
        (event) => {
            const separator = ' ';
            const { value = '' } = event.target;
            const { name, value: previousValue = '' } = field;
            const selectionEnd = inputRef.current && inputRef.current.selectionEnd;

            // Only allow digits and spaces
            if (new RegExp(`[^\\d${separator}]`).test(value)) {
                return form.setFieldValue(name, previousValue);
            }

            const maxLength = max(creditCardType(value).map((info) => max(info.lengths)));

            const formattedValue = formatCreditCardNumber(
                value.replace(new RegExp(separator, 'g'), '').slice(0, maxLength),
                separator,
            );

            if (selectionEnd === value.length && value.length < formattedValue.length) {
                nextSelectionEndRef.current = formattedValue.length;
            } else {
                nextSelectionEndRef.current = selectionEnd || 0;
            }

            void form.setFieldValue(name, formattedValue);
        },
        [field, form],
    );

    return (
        <>
            <TextInput
                {...field}
                additionalClassName="has-icon"
                autoComplete="cc-number"
                id={field.name}
                onChange={handleChange}
                ref={inputRef}
                type="tel"
            />

            <IconLock />
        </>
    );
};

export default memo(CreditCardNumberField);
