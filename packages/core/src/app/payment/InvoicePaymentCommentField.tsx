import { type FieldProps } from 'formik';
import React, { type FunctionComponent, useCallback } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { FormField, TextArea } from '@bigcommerce/checkout/ui';

import { InvoicePaymentCommentSessionStorage } from './InvoicePaymentCommentSessionStorage';

const InvoicePaymentCommentField: FunctionComponent = () => {
    const renderInput = useCallback(
        ({ field }: FieldProps<string>) => (
            <TextArea
                {...field}
                onChange={(event) => {
                    field.onChange(event);
                    InvoicePaymentCommentSessionStorage.set(event.target.value);
                }}
                testId="invoicePaymentComment-input"
            />
        ),
        [],
    );

    return (
        <FormField
            input={renderInput}
            labelContent={<TranslatedString id="payment.invoice_payment_comment_label" />}
            name="invoicePaymentComment"
        />
    );
};

export default InvoicePaymentCommentField;
