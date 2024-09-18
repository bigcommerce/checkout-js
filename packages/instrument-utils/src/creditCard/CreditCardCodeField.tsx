import { FieldProps } from 'formik';
import React, { FunctionComponent, memo, useCallback, useMemo } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';
import { FormField, IconHelp, IconLock, TextInput, TooltipTrigger } from '@bigcommerce/checkout/ui';

import CreditCardCodeTooltip from './CreditCardCodeTooltip';

export interface CreditCardCodeFieldProps {
    name: string;
}

const CreditCardCodeField: FunctionComponent<CreditCardCodeFieldProps> = ({ name }) => {
    const renderInput = useCallback(
        ({ field }: FieldProps) => (
            <>
                <TextInput
                    {...field}
                    additionalClassName="has-icon"
                    autoComplete="cc-csc"
                    id={field.name}
                    type="tel"
                />

                <IconLock />
            </>
        ),
        [],
    );

    const labelContent = useMemo(
        () => (
            <>
                <TranslatedString id="payment.credit_card_cvv_label" />

                <TooltipTrigger placement="top-start" tooltip={<CreditCardCodeTooltip />}>
                    <span className="has-tip">
                        <IconHelp />
                    </span>
                </TooltipTrigger>
            </>
        ),
        [],
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
