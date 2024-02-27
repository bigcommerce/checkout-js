import React, { FunctionComponent, memo, useEffect, useMemo } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { CheckboxFormField } from '@bigcommerce/checkout/ui';
import { usePaymentFormContext } from '@bigcommerce/checkout/payment-integration-api';

interface InstrumentStoreAsDefaultFieldProps {
    isAccountInstrument: boolean;
    disabled?: boolean;
}

const InstrumentStoreAsDefaultField: FunctionComponent<InstrumentStoreAsDefaultFieldProps> = ({
    isAccountInstrument,
    disabled = false,
}) => {
    const { paymentForm } = usePaymentFormContext();
    const translationId = isAccountInstrument
        ? 'payment.account_instrument_save_as_default_payment_method_label'
        : 'payment.instrument_save_as_default_payment_method_label';

    useEffect(() => {
        if (disabled) {
            paymentForm.setFieldValue('shouldSetAsDefaultInstrument', false);
        }
    }, [disabled, paymentForm]);

    const labelContent = useMemo(() => <TranslatedString id={translationId} />, [translationId]);

    return (
        <CheckboxFormField
            additionalClassName="form-field--setAsDefaultInstrument"
            disabled={disabled}
            labelContent={labelContent}
            name="shouldSetAsDefaultInstrument"
        />
    );
};

export default memo(InstrumentStoreAsDefaultField);
