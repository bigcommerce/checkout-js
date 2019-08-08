import creditCardType from 'credit-card-type';
import { FieldProps } from 'formik';
import { max } from 'lodash';
import React, { createRef, ChangeEventHandler, Component, Fragment, FunctionComponent, ReactNode, RefObject } from 'react';

import { TranslatedString } from '../../language';
import { FormField, TextInput } from '../../ui/form';
import { IconLock } from '../../ui/icon';

import formatCreditCardNumber from './formatCreditCardNumber';

export interface CreditCardNumberFieldProps {
    name: string;
}

const CreditCardNumberField: FunctionComponent<CreditCardNumberFieldProps> = ({ name }) => (
    <FormField
        additionalClassName="form-field--ccNumber"
        labelContent={
            <TranslatedString id="payment.credit_card_number_label" />
        }
        input={ ({ field, form }) => (
            <CreditCardNumberInput
                field={ field }
                form={ form }
            />
        ) }
        name={ name }
    />
);

class CreditCardNumberInput extends Component<FieldProps<string>> {
    private inputRef: RefObject<HTMLInputElement> = createRef();
    private nextSelectionEnd: number = 0;

    componentDidUpdate(): void {
        if (this.inputRef.current && this.inputRef.current.selectionEnd !== this.nextSelectionEnd) {
            this.inputRef.current.setSelectionRange(this.nextSelectionEnd, this.nextSelectionEnd);
        }
    }

    render(): ReactNode {
        const { field } = this.props;

        return (
            <Fragment>
                <TextInput
                    { ...field }
                    additionalClassName="has-icon"
                    autoComplete="cc-number"
                    ref={ this.inputRef }
                    id={ field.name }
                    onChange={ this.handleChange }
                    type="tel"
                />

                <IconLock />
            </Fragment>
        );
    }

    private handleChange: ChangeEventHandler<HTMLInputElement> = event => {
        const separator = ' ';
        const { value = '' } = event.target;
        const { field, form } = this.props;
        const { name, value: previousValue = '' } = field;
        const selectionEnd = this.inputRef.current && this.inputRef.current.selectionEnd;

        // Only allow digits and spaces
        if (new RegExp(`[^\\d${separator}]`).test(value)) {
            return form.setFieldValue(name, previousValue);
        }

        const maxLength = max(
            creditCardType(value)
                .map(info => max(info.lengths))
        );

        const formattedValue = formatCreditCardNumber(
            value.replace(new RegExp(separator, 'g'), '').slice(0, maxLength),
            separator
        );

        if (selectionEnd === value.length && value.length < formattedValue.length) {
            this.nextSelectionEnd = formattedValue.length;
        } else {
            this.nextSelectionEnd = selectionEnd || 0;
        }

        form.setFieldValue(name, formattedValue);
    };
}

export default CreditCardNumberField;
