import React, { type FunctionComponent } from 'react';

import { useLocale } from '@bigcommerce/checkout/contexts';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import { IconHelp, Tooltip, TooltipTrigger } from '@bigcommerce/checkout/ui';

import './ItemSplitTooltip.scss';

export const ItemSplitTooltip: FunctionComponent = () => {
    const { language } = useLocale();

    return (
        <TooltipTrigger
            ariaLabel={language.translate('shipping.multishipping_item_split_tooltip_action')}
            placement="right-start"
            tooltip={
                <Tooltip>
                    <TranslatedString id="shipping.multishipping_item_split_tooltip_message" />
                </Tooltip>
            }
        >
            <span className="item-split-tooltip" data-test="split-item-tooltip">
                <IconHelp />
            </span>
        </TooltipTrigger>
    );
};
