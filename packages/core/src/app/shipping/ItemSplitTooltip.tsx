import React, { type FunctionComponent } from "react";

import { TranslatedString } from "@bigcommerce/checkout/locale";
import { IconHelp, TooltipTrigger } from "@bigcommerce/checkout/ui";

import { Tooltip } from "../ui/tooltip";
import "./ItemSplitTooltip.scss";

export const ItemSplitTooltip: FunctionComponent = () => {
    return (
        <TooltipTrigger
            placement="right-start"
            tooltip={
                <Tooltip>
                    <TranslatedString
                        id="shipping.multishipping_item_split_tooltip_message"
                    />
                </Tooltip>
            }
        >
            <span className="item-split-tooltip" data-test="split-item-tooltip">
                <IconHelp />
            </span>
        </TooltipTrigger>
    )
};
