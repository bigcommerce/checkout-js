import React, { type FunctionComponent } from 'react';

import { useLocale } from '@bigcommerce/checkout/contexts';
import { IconHelp, TooltipTrigger } from '@bigcommerce/checkout/ui';

import CreditCardCodeTooltip from './CreditCardCodeTooltip';

export const CreditCardCodeTooltipTrigger: FunctionComponent = () => {
    const { language } = useLocale();

    return (
        <TooltipTrigger
            ariaLabel={language.translate('payment.credit_card_cvv_help_action')}
            placement="top-start"
            tooltip={<CreditCardCodeTooltip />}
        >
            <span className="has-tip">
                <IconHelp />
            </span>
        </TooltipTrigger>
    );
};
