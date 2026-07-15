import classNames from 'classnames';
import { type FieldProps } from 'formik';
import React, { type FunctionComponent, useCallback } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { FormField, TextArea } from '@bigcommerce/checkout/ui';

interface InvoicePaymentCommentFieldProps {
    isFloatingLabelEnabled?: boolean;
}

const InvoicePaymentCommentField: FunctionComponent<InvoicePaymentCommentFieldProps> = ({
    isFloatingLabelEnabled,
}) => {
    const renderInput = useCallback(
        ({ field }: FieldProps<string>) => (
            <TextArea
                {...field}
                id="invoicePaymentComment"
                isFloatingLabelEnabled={isFloatingLabelEnabled}
                rows={4}
                testId="invoicePaymentComment-input"
            />
        ),
        [],
    );

    return (
        <div
            className={classNames('dynamic-form-field', {
                'floating-form-field': isFloatingLabelEnabled,
            })}
        >
            <FormField
                id="invoicePaymentComment"
                input={renderInput}
                isFloatingLabelEnabled={isFloatingLabelEnabled}
                labelContent={<TranslatedString id="payment.invoice_payment_comment_label" />}
                name="invoicePaymentComment"
            />
        </div>
    );
};

export default InvoicePaymentCommentField;
