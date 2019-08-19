import React, { Fragment, FunctionComponent } from 'react';

import { TranslatedString } from '../../locale';
import { FormField, TextInput } from '../../ui/form';

export interface CreditCardCustomerCodeFieldProps {
    name: string;
}

const CreditCardCustomerCodeField: FunctionComponent<CreditCardCustomerCodeFieldProps> = ({ name }) => (
    <FormField
        labelContent={
            <Fragment>
                <TranslatedString id="payment.credit_card_customer_code_label" />

                { ' ' }

                <small className="optimizedCheckout-contentSecondary">
                    <TranslatedString id="common.optional_text" />
                </small>
            </Fragment>
        }
        input={ ({ field }) => (
            <TextInput
                { ...field }
                id={ field.name }
            />
        ) }
        name={ name }
    />
);

export default CreditCardCustomerCodeField;
