import { LineItemMap } from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import React, { ReactElement, useCallback, useState } from 'react';

import { TranslatedString } from '@bigcommerce/checkout/locale';

import { IconChevronDown, IconChevronUp } from '../ui/icon';
import { isSmallScreen } from '../ui/responsive';

import getItemsCount from './getItemsCount';
import mapFromCustom from './mapFromCustom';
import mapFromDigital from './mapFromDigital';
import mapFromGiftCertificate from './mapFromGiftCertificate';
import mapFromPhysical from './mapFromPhysical';
import OrderSummaryItem from './OrderSummaryItem';

const COLLAPSED_ITEMS_LIMIT = 4;
const COLLAPSED_ITEMS_LIMIT_SMALL_SCREEN = 3;

export interface OrderSummaryItemsProps {
    displayLineItemsCount: boolean;
    items: LineItemMap;
    themeV2?: boolean;
}

const OrderSummaryItems = ({
    displayLineItemsCount = true,
    items,
    themeV2 = false,
}: OrderSummaryItemsProps): ReactElement => {
    const [isExpanded, setIsExpanded] = useState(false);

    const collapsedLimit = isSmallScreen() ? COLLAPSED_ITEMS_LIMIT_SMALL_SCREEN : COLLAPSED_ITEMS_LIMIT;
    const getLineItemCount = useCallback(
        () =>
            ((items.customItems || []).length +
                items.physicalItems.length +
                items.digitalItems.length +
                items.giftCertificates.length),
        [items]
    );

    const handleToggle = useCallback(() => {
        setIsExpanded(prev => !prev);
    }, []);

    const renderActions = useCallback(() => {
        if (getLineItemCount() <= collapsedLimit) {
            return;
        }

        return (
            <div className="cart-actions">
                <button
                    className={classNames('button button--tertiary button--tiny optimizedCheckout-buttonSecondary',
                        { 'sub-text-medium': themeV2 })}
                    onClick={handleToggle}
                    type="button"
                >
                    {isExpanded ? (
                        <>
                            <TranslatedString id="cart.see_less_action" />
                            <IconChevronUp />
                        </>
                    ) : (
                        <>
                            <TranslatedString id="cart.see_all_action" />
                            <IconChevronDown />
                        </>
                    )}
                </button>
            </div>
        );
    }, [collapsedLimit, getLineItemCount, isExpanded]);

    return (
        <>
            {displayLineItemsCount && (
                <h3
                    className={classNames('cart-section-heading optimizedCheckout-contentPrimary', { 'body-medium': themeV2 })}
                    data-test="cart-count-total"
                >
                    <TranslatedString
                        data={{ count: getItemsCount(items) }}
                        id="cart.item_count_text"
                    />
                </h3>
            )}

            <ul aria-live="polite" className="productList">
                {[
                    ...items.physicalItems
                        .slice()
                        .sort((item) => item.variantId)
                        .map(mapFromPhysical),
                    ...items.giftCertificates.slice().map(mapFromGiftCertificate),
                    ...items.digitalItems
                        .slice()
                        .sort((item) => item.variantId)
                        .map(mapFromDigital),
                    ...(items.customItems || []).map(mapFromCustom),
                ]
                    .slice(0, isExpanded ? undefined : collapsedLimit)
                    .map((summaryItemProps) => (
                        <li className="productList-item is-visible" key={summaryItemProps.id}>
                            <OrderSummaryItem {...summaryItemProps} />
                        </li>
                    ))}
            </ul>

            {renderActions()}
        </>
    );
};

export default OrderSummaryItems;
