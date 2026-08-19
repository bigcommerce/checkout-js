import React, { type FunctionComponent, useCallback, useMemo } from 'react';

import { useLocale } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import {
    FormField,
    IconHelp,
    IconLock,
    TextInputIframeContainer,
    TooltipTrigger,
} from '@bigcommerce/checkout/ui';

import { CreditCardCodeTooltip } from '../creditCard';

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
    const { language } = useLocale();

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

    const labelContent = useMemo(
        () => (
            <>
                <TranslatedString id="payment.credit_card_cvv_label" />

                <TooltipTrigger
                    ariaLabel={language.translate('payment.credit_card_cvv_help_action')}
                    placement="top-start"
                    tooltip={<CreditCardCodeTooltip />}
                >
                    <span className="has-tip">
                        <IconHelp />
                    </span>
                </TooltipTrigger>
            </>
        ),
        [language],
    );

    return (
        <FormField
            additionalClassName="form-ccFields-field--ccCvv"
            input={renderInput}
            labelContent={labelContent}
            name={name}
        />
    );
};

export default HostedCreditCardCodeField;
