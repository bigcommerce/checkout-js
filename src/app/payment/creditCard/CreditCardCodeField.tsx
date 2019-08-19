import React, { Fragment, FunctionComponent } from 'react';

import { TranslatedString } from '../../locale';
import { FormField, TextInput } from '../../ui/form';
import { IconHelp, IconLock } from '../../ui/icon';
import { TooltipTrigger } from '../../ui/tooltip';

import CreditCardCodeTooltip from './CreditCardCodeTooltip';

export interface CreditCardCodeFieldProps {
    name: string;
}

const CreditCardCodeField: FunctionComponent<CreditCardCodeFieldProps> = ({ name }) => (
    <FormField
        additionalClassName="form-ccFields-field--ccCvv"
        labelContent={
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
        }
        input={ ({ field }) =>
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
        }
        name={ name }
    />
);

export default CreditCardCodeField;
