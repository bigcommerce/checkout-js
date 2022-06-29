import { FieldProps } from 'formik';
import React, { memo, useCallback, useMemo, Fragment, FunctionComponent } from 'react';

import { TranslatedString } from '../../locale';
import { FormField, TextInput } from '../../ui/form';
import { IconHelp, IconLock } from '../../ui/icon';
import { TooltipTrigger } from '../../ui/tooltip';

import CreditCardCodeTooltip from './CreditCardCodeTooltip';

export interface CreditCardCodeFieldProps {
    name: string;
}

const CreditCardCodeField: FunctionComponent<CreditCardCodeFieldProps> = ({ name }) => {
    const renderInput = useCallback(({ field }: FieldProps) => (
        <Fragment>
            <TextInput
                { ...field }
                additionalClassName="has-icon"
                autoComplete="cc-csc"
                id={ field.name }
                type="tel"
            />

            <IconLock />
        </Fragment>
    ), []);

    const labelContent = useMemo(() => (
        <Fragment>
            <TranslatedString id="payment.credit_card_cvv_label" />

            <TooltipTrigger
                placement="top-start"
                tooltip={ <CreditCardCodeTooltip /> }
            >
                <span className="has-tip">
                    <IconHelp />
                </span>
            </TooltipTrigger>
        </Fragment>
    ), []);

    return <FormField
        additionalClassName="form-ccFields-field--ccCvv"
        input={ renderInput }
        labelContent={ labelContent }
        name={ name }
    />;
};

export default memo(CreditCardCodeField);
