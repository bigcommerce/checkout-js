import { FieldProps } from 'formik';
import React, { FunctionComponent, memo, useCallback, useMemo } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import { FormField, TextInput } from '../../ui/form';

export interface CreditCardCustomerCodeFieldProps {
    name: string;
}

const CreditCardCustomerCodeField: FunctionComponent<CreditCardCustomerCodeFieldProps> = ({
    name,
}) => {
    const renderInput = useCallback(
        ({ field }: FieldProps) => <TextInput {...field} id={field.name} />,
        [],
    );

    const labelContent = useMemo(
        () => (
            <>
                <TranslatedString id="payment.credit_card_customer_code_label" />{' '}
                <small className="optimizedCheckout-contentSecondary">
                    <TranslatedString id="common.optional_text" />
                </small>
            </>
        ),
        [],
    );

    return <FormField input={renderInput} labelContent={labelContent} name={name} />;
};

export default memo(CreditCardCustomerCodeField);
