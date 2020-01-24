import React, { useCallback, FunctionComponent } from 'react';

import { TranslatedString } from '../../locale';
import { FormField, TextInputIframeContainer } from '../../ui/form';
import { IconLock } from '../../ui/icon';

export interface HostedCreditCardCodeFieldProps {
    appearFocused: boolean;
    id: string;
    name: string;
}

const HostedCreditCardCodeField: FunctionComponent<HostedCreditCardCodeFieldProps> = ({
    appearFocused,
    id,
    name,
}) => {
    const renderInput = useCallback(() => (<>
        <TextInputIframeContainer
            additionalClassName="has-icon"
            appearFocused={ appearFocused }
            id={ id }
        />

        <IconLock />
    </>), [id, appearFocused]);

    return (
        <FormField
            additionalClassName="form-ccFields-field--ccCvv"
            input={ renderInput }
            labelContent={ <TranslatedString id="payment.credit_card_cvv_label" /> }
            name={ name }
        />
    );
};

export default HostedCreditCardCodeField;
