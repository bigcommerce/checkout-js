import React, { FunctionComponent, useCallback } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { FormField, IconLock, TextInputIframeContainer } from '@bigcommerce/checkout/ui';

export interface HostedCreditCardNumberFieldProps {
    appearFocused: boolean;
    id: string;
    name: string;
}

const HostedCreditCardNumberField: FunctionComponent<HostedCreditCardNumberFieldProps> = ({
    appearFocused,
    id,
    name,
}) => {
    const renderInput = useCallback(
        () => (
            <>
                <TextInputIframeContainer
                    additionalClassName="has-icon"
                    appearFocused={appearFocused}
                    id={id}
                />

                <IconLock />
            </>
        ),
        [id, appearFocused],
    );

    return (
        <FormField
            additionalClassName="form-field--ccNumber"
            input={renderInput}
            labelContent={<TranslatedString id="payment.credit_card_number_label" />}
            name={name}
        />
    );
};

export default HostedCreditCardNumberField;
