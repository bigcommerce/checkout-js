import React, { type FunctionComponent, memo, useEffect, useMemo } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { usePaymentFormContext } from '@bigcommerce/checkout/payment-integration-api';
import { CheckboxFormField } from '@bigcommerce/checkout/ui';

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
        // Ignoring paymentForm dependency as it causes sequential re-renders when included in array
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [disabled]);

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
