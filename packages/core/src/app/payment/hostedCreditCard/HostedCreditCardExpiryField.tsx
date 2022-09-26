import React, { FunctionComponent, useCallback } from 'react';

import { TranslatedString } from '../../locale';
import { FormField, TextInputIframeContainer } from '../../ui/form';

export interface HostedCreditCardExpiryFieldProps {
    appearFocused: boolean;
    id: string;
    name: string;
}

const HostedCreditCardExpiryField: FunctionComponent<HostedCreditCardExpiryFieldProps> = ({
    appearFocused,
    id,
    name,
}) => {
    const renderInput = useCallback(
        () => <TextInputIframeContainer appearFocused={appearFocused} id={id} />,
        [id, appearFocused],
    );

    return (
        <FormField
            additionalClassName="form-field--ccExpiry"
            input={renderInput}
            labelContent={<TranslatedString id="payment.credit_card_expiration_label" />}
            name={name}
        />
    );
};

export default HostedCreditCardExpiryField;
