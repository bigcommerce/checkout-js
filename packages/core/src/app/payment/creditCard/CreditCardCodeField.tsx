import { type FieldProps } from 'formik';
import React, { type FunctionComponent, memo, useCallback, useMemo } from 'react';

import { useLocale } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { FormField, IconHelp, IconLock, TextInput, TooltipTrigger } from '@bigcommerce/checkout/ui';

import CreditCardCodeTooltip from './CreditCardCodeTooltip';

export interface CreditCardCodeFieldProps {
    name: string;
}

const CreditCardCodeField: FunctionComponent<CreditCardCodeFieldProps> = ({ name }) => {
    const { language } = useLocale();
    const labelTextId = `${name}-label-text`;
    const errorId = `${name}-field-error-message`;

    const renderInput = useCallback(
        ({ field }: FieldProps) => (
            <>
                <TextInput
                    {...field}
                    additionalClassName="has-icon"
                    aria-describedby={errorId}
                    aria-labelledby={labelTextId}
                    autoComplete="cc-csc"
                    id={field.name}
                    type="tel"
                />

                <IconLock />
            </>
        ),
        [errorId, labelTextId],
    );

    const labelContent = useMemo(
        () => (
            <>
                <span id={labelTextId}>
                    <TranslatedString id="payment.credit_card_cvv_label" />
                </span>

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
        [labelTextId, language],
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

export default memo(CreditCardCodeField);
