import { type FieldProps } from 'formik';
import React, { type FunctionComponent, useCallback } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { FormField, TextArea } from '@bigcommerce/checkout/ui';
import { B2BPaymentFieldsSessionStorage } from '@bigcommerce/checkout/utility';

const InvoicePaymentCommentField: FunctionComponent = () => {
    const renderInput = useCallback(
        ({ field }: FieldProps<string>) => (
            <TextArea
                {...field}
                id="invoicePaymentComment"
                onChange={(event) => {
                    field.onChange(event);
                    B2BPaymentFieldsSessionStorage.set(
                        B2BPaymentFieldsSessionStorage.INVOICE_COMMENT_KEY,
                        event.target.value,
                    );
                }}
                rows={4}
                testId="invoicePaymentComment-input"
            />
        ),
        [],
    );

    return (
        <div className="dynamic-form-field">
            <FormField
                id="invoicePaymentComment"
                input={renderInput}
                labelContent={<TranslatedString id="payment.invoice_payment_comment_label" />}
                name="invoicePaymentComment"
            />
        </div>
    );
};

export default InvoicePaymentCommentField;
